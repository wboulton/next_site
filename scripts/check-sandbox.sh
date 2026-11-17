#!/usr/bin/env bash
set -euo pipefail
container=${1:-next-site}

# Exercise a fresh jail using the running container's exact nsjail policies.
# docker exec alone would run outside the jail and would not test isolation.
docker exec -i "$container" /usr/local/bin/nsjail \
  --config /etc/nsjail/nsjail.cfg -- /usr/local/bin/node --input-type=module - <<'JS'
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

assert.equal(process.getuid(), 1000);
assert.equal(process.getgid(), 1000);
assert.equal(process.pid, 1, 'Node must run in a new PID namespace');
const status = fs.readFileSync('/proc/self/status', 'utf8');
assert.match(status, /^CapEff:\s+0+$/m);
assert.match(status, /^CapBnd:\s+0+$/m);
assert.match(status, /^NoNewPrivs:\s+1$/m);
assert.match(status, /^Seccomp:\s+2$/m);
assert.ok(Number(status.match(/^Seccomp_filters:\s+(\d+)$/m)?.[1]) >= 2);
assert.equal(fs.existsSync('/bin/sh'), false);
assert.equal(fs.existsSync('/usr/local/bin/nsjail'), false);
assert.equal(fs.existsSync('/etc/nsjail'), false);
assert.equal(fs.existsSync('/var/run/docker.sock'), false);
const mounts = fs.readFileSync('/proc/self/mountinfo', 'utf8').trim().split('\n').map(line => line.split(' '));
assert.ok(mounts.some(fields => fields[4] === '/app' && fields[5].split(',').includes('ro')));
for (const file of ['/app/server.js', '/app/package.json']) {
  const fd = fs.openSync(file, 'r');
  fs.closeSync(fd);
  assert.throws(() => fs.openSync(file, 'r+'), error => ['EROFS', 'EACCES'].includes(error.code));
}
for (const dir of ['/tmp', '/app/.next/cache']) {
  const file = `${dir}/sandbox-check`;
  fs.writeFileSync(file, 'ok');
  fs.unlinkSync(file);
}
// A script in a writable tmpfs still cannot be executed (MS_NOEXEC).
const executable = '/tmp/sandbox-exec-check';
fs.writeFileSync(executable, '#!/usr/local/bin/node\n', { mode: 0o755 });
assert.equal(spawnSync(executable).error?.code, 'EACCES');
fs.unlinkSync(executable);
let response;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    response = await fetch('http://127.0.0.1:3000');
    if (response.ok) break;
  } catch {
    // The standalone server may still be starting on a freshly launched container.
  }
  await new Promise(resolve => setTimeout(resolve, 500));
}
assert.equal(response?.status, 200, 'The jailed app must serve HTTP');
console.log('Sandbox checks passed: UID, capabilities, PID namespace, seccomp, read-only app, hidden supervisor, writable cache, noexec tmpfs, HTTP.');
JS
