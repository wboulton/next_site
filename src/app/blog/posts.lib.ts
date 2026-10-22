import { execFile } from 'child_process';
import fs from 'fs/promises';
import { promisify } from 'util';
import path from 'path';

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: Date;
};

export const postsDir = path.join(
  process.cwd(),
  'src',
  'app',
  'blog',
  'posts'
);

const execFileAsync = promisify(execFile);

export async function getBlogPostCreatedAt(filePath: string): Promise<Date> {
  const { stdout } = await execFileAsync(
    'git',
    [
      'log',
      '--follow',
      '--diff-filter=A',
      '--format=%aI',
      '--',
      path.relative(process.cwd(), filePath),
    ],
    { cwd: process.cwd() }
  );
  const addedAt = stdout.trim().split('\n').filter(Boolean).pop();

  // Uncommitted posts can still be previewed locally.
  const date = addedAt ?? (await fs.stat(filePath)).birthtime.toISOString();
  // Preserve the calendar date in the original commit's timezone.
  return new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
}

export function formatBlogPostDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const extractTitle = (markdown: string, fallback: string): string => {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim() : fallback;
};

const extractExcerpt = (markdown: string): string => {
  const body = markdown
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^#\s+.+\n?/m, '')
    .replace(/^\s+/, '');

  const firstParagraph = body.split(/\n\s*\n/)[0] ?? '';

  if (/^(#{1,6}\s|```)/.test(firstParagraph)) return '';

  return firstParagraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  const entries = await fs.readdir(postsDir);
  const mdFiles = entries.filter((f) => f.endsWith('.md'));

  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      const filePath = path.join(postsDir, file);
      const [createdAt, content] = await Promise.all([
        getBlogPostCreatedAt(filePath),
        fs.readFile(filePath, 'utf8'),
      ]);
      const slug = file.replace(/\.md$/, '');
      return {
        slug,
        title: extractTitle(content, slug),
        excerpt: extractExcerpt(content),
        createdAt,
      };
    })
  );

  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
