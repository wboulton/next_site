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

      <nav className="top-bar-right">
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
