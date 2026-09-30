import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Building2, ChevronRight, ChevronUp, CircleArrowDown, CircleArrowUp, CirclePlus, Home, Layers3,
  Coins, ScrollText, RefreshCw, ShieldCheck, Webhook, Plug, Wallet, Users, Scale,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Logo from './Logo';
import { business } from '../data/mock';

interface Item { label: string; to: string; icon: LucideIcon; children?: { label: string; to: string }[] }
interface Group { title?: string; items: Item[] }

const groups: Group[] = [
  {
    items: [
      { label: 'Home', to: '/', icon: Home },
      { label: 'Balance', to: '/balance', icon: Wallet },
      { label: 'Transactions', to: '/transactions', icon: Coins },
      { label: 'Report Schedules', to: '/report-schedules', icon: ScrollText },
      {
        label: 'Accept Payments', to: '/accept-payments', icon: CircleArrowDown,
        children: [
          { label: 'Payment Links', to: '/accept-payments/payment-links' },
          { label: 'Invoices', to: '/accept-payments/invoices' },
          { label: 'Payment Sessions', to: '/accept-payments/sessions' },
        ],
      },
      { label: 'Subscriptions', to: '/subscriptions', icon: RefreshCw },
      { label: 'Dispute', to: '/dispute', icon: Scale },
      {
        label: 'Send Payments', to: '/send-payments', icon: CircleArrowUp,
        children: [
          { label: 'Payouts', to: '/send-payments/payouts' },
        ],
      },
    ],
  },
  { title: 'Apps & Partners', items: [{ label: 'xenPlatform', to: '/xenplatform', icon: Users }] },
  { title: 'Developers', items: [{ label: 'Webhook Logs', to: '/webhook-logs', icon: Webhook }] },
  {
    title: 'Configuration',
    items: [
      { label: 'Plug-ins', to: '/plug-ins', icon: Plug },
      { label: 'Payment Channels', to: '/payment-channels', icon: CirclePlus },
      { label: 'Activity Logs', to: '/activity-logs', icon: ShieldCheck },
    ],
  },
];

function NavItem({ item }: { item: Item }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(item.children ? pathname.startsWith(item.to) : false);
  const Icon = item.icon;

  if (item.children) {
    return (
      <>
        <button className="nav-item" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <Icon size={17} strokeWidth={1.6} />
          <span>{item.label}</span>
          <svg width="8" height="8" viewBox="0 0 8 8" className={`chev ${open ? 'open' : ''}`} fill="currentColor"><path d="M1.5 0.5 7 4 1.5 7.5z" /></svg>
        </button>
        {open && item.children.map((c) => (
          <NavLink key={c.to} to={c.to} className={({ isActive }) => `nav-item sub ${isActive ? 'active' : ''}`}>
            <span>{c.label}</span>
          </NavLink>
        ))}
      </>
    );
  }
  return (
    <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <Icon size={17} strokeWidth={1.6} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const orgRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand"><Logo /><span>Xendit</span></div>
      <nav className="nav">
        {groups.map((g, i) => (
          <div key={i} className="nav-group">
            {g.title && <div className="nav-title">{g.title}</div>}
            {g.items.map((it) => <NavItem key={it.to} item={it} />)}
          </div>
        ))}
      </nav>
      <div className="org-wrap" ref={orgRef}>
        {menuOpen && (
          <div className="org-menu" role="menu">
            <button role="menuitem">Switch Business<ChevronRight size={18} strokeWidth={1.3} /></button>
            <button role="menuitem">Add New Business</button>
            <hr />
            <button role="menuitem">Language<ChevronRight size={18} strokeWidth={1.3} /></button>
            <button role="menuitem">Help<ChevronRight size={18} strokeWidth={1.3} /></button>
            <button role="menuitem" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>Settings</button>
            <hr />
            <button role="menuitem">Edit Profile</button>
            <button role="menuitem" className="danger">Sign Out</button>
          </div>
        )}
        <div className={`org ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen((o) => !o)} role="button" tabIndex={0}>
          <span className="org-logo"><Building2 size={24} strokeWidth={1.3} /></span>
          <div className="org-meta">
            <div className="org-name">{business.name}</div>
            {menuOpen
              ? <div className="org-user">{business.user}</div>
              : <span className="mode-badge">{business.mode}</span>}
          </div>
          {menuOpen
            ? <ChevronUp size={20} strokeWidth={1.5} />
            : <button className="icon-btn" aria-label="Notifications" onClick={(e) => e.stopPropagation()}><Bell size={16} strokeWidth={1.5} /></button>}
        </div>
      </div>
    </aside>
  );
}
