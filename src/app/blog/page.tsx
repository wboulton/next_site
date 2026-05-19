import Link from 'next/link';
import { getBlogPosts } from './posts.lib';
import './blog.css';

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="page-shell">
      <main className="page-main page-main-narrow">
        <article className="article">
          <header className="article-header">
            <h1 className="article-title">Blog</h1>
            <p className="article-subtitle">
              Here is a general collection of blog posts about things like my homelab/server setup and research.
            </p>
          </header>

          <div className="blog-list">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="writeup-card">
                <span className="writeup-card-title">{p.title}</span>
                <span className="writeup-card-event">
                  {p.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {p.excerpt && (
                  <span className="writeup-card-excerpt">{p.excerpt}</span>
                )}
              </Link>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
