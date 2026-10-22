import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { formatBlogPostDate, getBlogPostCreatedAt, getBlogPosts, postsDir } from '../posts.lib';
import '../../components/WriteupLayout.css';
import '../blog.css';

// Every post is rendered at build time, when Git history is available.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(postsDir, `${slug}.md`);

  const stat = await fs.stat(filePath).catch(() => null);
  if (!stat) notFound();

  const markdown = await fs.readFile(filePath, 'utf8');
  const formattedDate = formatBlogPostDate(await getBlogPostCreatedAt(filePath));

  return (
    <div className="page-shell">
      <main className="page-main page-main-narrow">
        <article className="article">
          <header className="article-header">
            <div className="article-eyebrow">{formattedDate}</div>
          </header>
          <div className="article-body markdown-body blog-post">
            <MarkdownRenderer content={markdown} imageBasePath="/blog" />
          </div>
        </article>
      </main>
    </div>
  );
}
