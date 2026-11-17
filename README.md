# NEXT website
This repository contains an in-development next application that may replace my react app on AWS. Currently, I have a react app running my personal [website](http://williamboulton.com/) which you can see [here](https://github.com/wboulton/personalsite/tree/main/public_website). I am writing this full next.js application to learn more full-stack web development and explore javascript/typescript.

Use Node.js 26.13.1 or a newer Node 26 release, then run:

```bash
npm ci
npm run dev
```
in the project root. 

## Production container

The Docker image builds the resume with LaTeX and runs the Next.js standalone
server under nsjail 3.6, pinned to its release commit. The supervisor and server
run as UID/GID 1000, with no Docker capabilities. The jail creates separate user,
mount, PID, IPC, UTS and cgroup namespaces, exposes the application read-only,
and provides bounded writable tmpfs mounts for `/tmp` and `.next/cache`.
The app shares Docker's network namespace so published ports work. This permits
outbound connections; nsjail does not implement an egress firewall here.

Run these commands **on the machine hosting the website**. It must use Linux,
support unprivileged user namespaces, and run Docker with seccomp enabled.
On hosts with AppArmor, first install this dedicated profile as administrator:

```bash
sudo install -m 644 docker/apparmor.profile /etc/apparmor.d/next-site-nsjail
sudo apparmor_parser -r -W /etc/apparmor.d/next-site-nsjail
```

This allows namespace and mount setup for the named profile without changing
host-wide AppArmor settings. The launch script selects it when Docker reports
AppArmor support; a missing profile makes startup fail. Hosts without AppArmor
still use the same nsjail, seccomp, filesystem and resource restrictions.

```bash
docker build --pull -t next-site:latest .
bash scripts/run-container.sh next-site:latest next-site 3000
bash scripts/check-sandbox.sh next-site
```

Use the shared launch script for both local verification and production. It
applies the Docker seccomp allowlist, which permits nsjail's namespace setup;
nsjail then adds a second filter that blocks namespace creation, mounts, tracing
and other privileged operations before executing Node. The container has a
read-only filesystem, a 512 MiB memory limit, one CPU and a 128-task limit.
It never falls back to starting Node directly when sandbox setup fails.
`systempaths=unconfined` removes Docker's procfs overmounts so the unprivileged
supervisor can mount a new read-only `/proc` showing only the jailed processes.
The jail exposes no `/sys`, shell, Docker socket or supervisor binary.

`docker/seccomp.json` is derived from
[Moby's default seccomp profile](https://github.com/moby/profiles/blob/f862455628f78f84c937e967e4a03902fb1dee11/seccomp/default.json)
with only six extra setup syscalls enabled: `clone`, `mount`, `pivot_root`,
`sethostname`, `umount2` and `unshare`. Its upstream license is included in
`docker/SECCOMP-LICENSE`.

## Checks

```bash
npm outdated
npm audit
npm run lint
npm run typecheck
npm run build
npm run test:sandbox -- next-site
```

The local production build requires `pdflatex` and the packages used by the
resume. Docker installs these only in the build stage. Biome replaces the
removed `next lint` command. `check-sandbox.sh` checks the effective UID,
capabilities, PID namespace, stacked seccomp filters, read-only code, writable
cache, inaccessible supervisor and HTTP response from within a fresh jail.

## Gitea

Pushing to `main` triggers `.gitea/workflows/deploy.yml`, which connects to the
separate web server and builds the image there. It starts a candidate on port
3001 with the shared launch script, checks HTTP and sandbox behavior, and only
then replaces the production container on port 3000. Install the AppArmor
profile on that server before the first deployment if it uses AppArmor.

Gitea uses the public github repo as a push mirror to allow this code to be public facing without publicizing my gitea instance.
