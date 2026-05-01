import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { writeups } from '../writeups';
import './writeups-index.css';

export default function WriteupsIndexPage() {
  return (
    <div className="page-shell">
      <Sidebar />
      <main className="page-main">
        <article className="article">
          <header className="article-header">
            <div className="article-eyebrow">CTF</div>
            <h1 className="article-title">Writeups</h1>
            <p className="article-subtitle">
              A collection of CTF challenge writeups across crypto, pwn, and
              reverse engineering.
            </p>
          </header>

          <div className="writeup-grid">
            {writeups.map((w) => (
              <Link key={w.slug} href={w.route} className="writeup-card">
                <span className="writeup-card-tag">{w.category}</span>
                <span className="writeup-card-title">{w.title}</span>
                <span className="writeup-card-event">{w.event}</span>
              </Link>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
