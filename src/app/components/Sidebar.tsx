import Link from 'next/link';
import { writeups } from '../writeups';
import './Sidebar.css';

type SidebarProps = {
  currentSlug?: string;
};

const Sidebar = ({ currentSlug }: SidebarProps) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-eyebrow">CTF</div>
        <div className="sidebar-title">Writeups</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Writeups</div>
        <ul className="sidebar-list">
          {writeups.map((w) => {
            const active = w.slug === currentSlug;
            return (
              <li key={w.slug}>
                <Link
                  href={w.route}
                  className={`sidebar-item${active ? ' sidebar-item-active' : ''}`}
                >
                  <span className="sidebar-item-title">{w.title}</span>
                  <span className="sidebar-item-meta">
                    {w.event} &middot; {w.category}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
