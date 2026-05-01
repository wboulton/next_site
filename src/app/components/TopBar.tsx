import Link from 'next/link';
import './TopBar.css';

const TopBar = () => {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <Link href="/About" className="top-bar-brand">
          <span className="top-bar-brand-mark">wb</span>
          <span className="top-bar-brand-text">William Boulton</span>
        </Link>
      </div>

      <div className="top-bar-center">
        <div className="top-bar-search" aria-hidden="true">
          <svg
            className="top-bar-search-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="top-bar-search-placeholder">Search</span>
          <span className="top-bar-search-shortcut">CTRL K</span>
        </div>
      </div>

      <nav className="top-bar-right">
        <span className="top-bar-icon" aria-hidden="true" title="Theme">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
        <Link href="/About" className="top-bar-link">
          About
        </Link>
        <Link href="/Writeups" className="top-bar-link">
          Writeups
        </Link>
        <Link href="/Other" className="top-bar-link">
          Other
        </Link>
        <a
          href="https://github.com/wboulton"
          target="_blank"
          rel="noopener noreferrer"
          className="top-bar-pill"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/william-boulton-a958832ba/"
          target="_blank"
          rel="noopener noreferrer"
          className="top-bar-pill"
        >
          LinkedIn
        </a>
      </nav>
    </header>
  );
};

export default TopBar;
