import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { writeups } from '../writeups';
import './WriteupLayout.css';

type WriteupLayoutProps = {
  currentSlug?: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  children: ReactNode;
};

const WriteupLayout = ({
  currentSlug,
  title,
  subtitle,
  meta,
  children,
}: WriteupLayoutProps) => {
  const current = writeups.find((w) => w.slug === currentSlug);

  return (
    <div className="page-shell">
      <Sidebar currentSlug={currentSlug} />
      <main className="page-main">
        <article className="article">
          <header className="article-header">
            {current && (
              <div className="article-eyebrow">
                {current.event} &middot; {current.category}
              </div>
            )}
            <h1 className="article-title">{title}</h1>
            {subtitle && <p className="article-subtitle">{subtitle}</p>}
            {meta && <div className="article-meta">{meta}</div>}
          </header>
          <div className="article-body markdown-body">{children}</div>
        </article>
      </main>
    </div>
  );
};

export default WriteupLayout;
