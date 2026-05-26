import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
const TEX_PATH = path.join(process.cwd(), 'src/app/resume/resume.tex');

let cache: { mtimeMs: number; pdf: Uint8Array } | null = null;

async function compile(): Promise<Uint8Array> {
  const stat = await fs.stat(TEX_PATH);
  if (cache && cache.mtimeMs === stat.mtimeMs) return cache.pdf;

  const source = await fs.readFile(TEX_PATH);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'));
  try {
    const inputPath = path.join(tmpDir, 'resume.tex');
    await fs.writeFile(inputPath, source);
    const pdfPath = path.join(tmpDir, 'resume.pdf');
    try {
      await execFileP(
        'pdflatex',
        [
          '-interaction=nonstopmode',
          '-output-directory',
          tmpDir,
          inputPath,
        ],
        { cwd: tmpDir, maxBuffer: 16 * 1024 * 1024 },
      );
    } catch (err) {
      // pdflatex can exit nonzero on recoverable errors yet still produce a PDF.
      // Only rethrow if no PDF was emitted.
      const e = err as { stdout?: string; stderr?: string; message?: string };
      const exists = await fs.access(pdfPath).then(() => true, () => false);
      if (!exists) {
        const log = await fs
          .readFile(path.join(tmpDir, 'resume.log'), 'utf8')
          .catch(() => '');
        throw new Error(
          [e.message, e.stdout, e.stderr, log].filter(Boolean).join('\n\n'),
        );
      }
    }
    const pdf = await fs.readFile(pdfPath);
    const bytes = new Uint8Array(pdf);
    cache = { mtimeMs: stat.mtimeMs, pdf: bytes };
    return bytes;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

export async function GET() {
  try {
    const pdf = await compile();
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const e = err as { message?: string; stdout?: string; stderr?: string };
    const detail = [e.message, e.stdout, e.stderr].filter(Boolean).join('\n\n');
    return new Response(`Failed to compile resume.tex:\n\n${detail}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
