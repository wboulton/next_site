export default function AboutPage() {
  return (
    <div className="page-shell">
      <main className="page-main page-main-narrow">
        <article className="article">
          <header className="article-header">
            <div className="article-eyebrow">About</div>
            <h1 className="article-title">William Boulton</h1>
            <p className="article-subtitle">
              CS @ Purdue &middot; cybersecurity, CTFs, and reverse engineering
            </p>
          </header>

          <div className="article-body markdown-body">
            <p>
              I&apos;m a freshman at Purdue University in West Lafayette,
              Indiana, studying computer science with a focus on cybersecurity.
              I&apos;m most interested in CTFs and offensive security &mdash;
              particularly the reverse engineering category.
            </p>

            <h2>Contact</h2>
            <p>
              Email me at{' '}
              <a href="mailto:williamdboulton@gmail.com">
                williamdboulton@gmail.com
              </a>
              .
            </p>

            <h2>Links</h2>
            <ul>
              <li>
                LinkedIn:{' '}
                <a
                  href="https://www.linkedin.com/in/william-boulton-a958832ba/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  William Boulton
                </a>
              </li>
              <li>
                GitHub:{' '}
                <a
                  href="https://github.com/wboulton"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  wboulton
                </a>
              </li>
            </ul>
          </div>
        </article>
      </main>
    </div>
  );
}
