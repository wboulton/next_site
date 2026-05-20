import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { getBlogPosts, postsDir } from '../posts.lib';
import '../../components/WriteupLayout.css';
import '../blog.css';

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
  const formattedDate = stat.birthtime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
