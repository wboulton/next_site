export default function AboutPage() {
  return (
    <div className="page-shell">
      <main className="page-main page-main-narrow">
        <article className="article">
          <header className="article-header">
            <div className="article-eyebrow">About</div>
            <h1 className="article-title">William Boulton</h1>
            <p className="article-subtitle">
              Computer Science Student at Purdue University
            </p>
          </header>

          <div className="article-body markdown-body">
            <p>
              I&apos;m a junior at Purdue University in West Lafayette,
              Indiana, studying computer science with a focus on cybersecurity.
              I&apos;m involved in b01lers (Purdue's CTF team) and undergraduate research on
              software supply chain security and supply chain optimizaiton.
              I am most intrested in software supply chain and cloud security and quantum computing.
            </p>

            <h2>Contact</h2>
            <p>
              Email me at{' '}
              <a href="mailto:mail@williamboulton.com">
                mail@williamboulton.com
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


