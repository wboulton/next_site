import fs from 'fs/promises';
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
      const [stat, content] = await Promise.all([
        fs.stat(filePath),
        fs.readFile(filePath, 'utf8'),
      ]);
      const slug = file.replace(/\.md$/, '');
      return {
        slug,
        title: extractTitle(content, slug),
        excerpt: extractExcerpt(content),
        createdAt: stat.birthtime,
      };
    })
  );

  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
