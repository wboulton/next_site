export default function ResumePage() {
  return (
    <div className="page-shell">
      <main className="page-main page-main-narrow">
        <article className="article">
          <div className="article-eyebrow">Resume</div>

          <object
            data="/resume.pdf"
            type="application/pdf"
            style={{
              width: '100%',
              height: '90vh',
              border: '1px solid var(--border)',
              borderRadius: '4px',
            }}
          >
            <p>
              Your browser can&apos;t display PDFs inline.{' '}
              <a href="/resume.pdf">Open the resume PDF</a>.
            </p>
          </object>
        </article>
      </main>
    </div>
  );
}
