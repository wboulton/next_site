#!/usr/bin/env node
// Compiles src/app/resume/resume.tex into public/resume.pdf at build time so
// the runtime image doesn't need a LaTeX toolchain.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const texPath = path.join(root, 'src/app/resume/resume.tex');
const outPath = path.join(root, 'public/resume.pdf');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-'));
try {
  const inputPath = path.join(tmpDir, 'resume.tex');
  fs.copyFileSync(texPath, inputPath);

  try {
    execFileSync(
      'pdflatex',
      ['-interaction=nonstopmode', '-output-directory', tmpDir, inputPath],
      { cwd: tmpDir, stdio: 'inherit' },
    );
  } catch (err) {
    if (!fs.existsSync(path.join(tmpDir, 'resume.pdf'))) throw err;
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.copyFileSync(path.join(tmpDir, 'resume.pdf'), outPath);
  console.log(`Wrote ${path.relative(root, outPath)}`);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
