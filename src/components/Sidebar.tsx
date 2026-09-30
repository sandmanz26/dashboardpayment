import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Bell, Building2, ChevronRight, CircleArrowDown, CircleArrowUp, CirclePlus, Home, Layers3,
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
          { label: 'Single Payout', to: '/send-payments/single' },
          { label: 'Batch Payout', to: '/send-payments/batch' },
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
          <ChevronRight size={12} fill="currentColor" className={`chev ${open ? 'open' : ''}`} />
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
      <div className="org">
        <Building2 size={24} strokeWidth={1.3} className="org-icon" />
        <div className="org-meta">
          <div className="org-name">{business.name}</div>
          <span className="mode-badge">{business.mode}</span>
        </div>
        <button className="icon-btn" aria-label="Notifications"><Bell size={16} strokeWidth={1.5} /></button>
      </div>
      
    </aside>
  );
}
