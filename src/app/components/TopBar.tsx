import Link from 'next/link';
import './TopBar.css'; 

const TopBar = () => {
  return (
    <div className="top-bar">
      <Link href="/About" passHref>
        <button className="top-bar-button">
          About
        </button>
      </Link>
      <Link href="/Writeups" passHref>
        <button className="top-bar-button">
          Writeups
        </button>
      </Link>
      <Link href="/Other" passHref>
        <button className="top-bar-button">
          Other
        </button>
      </Link>
    </div>
  );
};

export default TopBar;