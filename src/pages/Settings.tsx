import { Code, CircleArrowUp, ReceiptText, UserRoundCog, Users, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useDevMode } from '../dev/DevMode';

interface Entry { title: string; desc: string; icon: LucideIcon; to: string }

const account: Entry[] = [
  { title: 'Your Business & Profile', desc: 'View and update your business details, company logo, and security settings', icon: UserRoundCog, to: '/settings/business' },
  { title: 'Your Team', desc: 'Invite or remove team members to this account and configure their permissions', icon: Users, to: '/settings/team' },
  { title: 'Billing', desc: 'Pay your bills, download past billing statements, and retrieve your tax documents', icon: ReceiptText, to: '/settings/billing' },
  { title: 'Balances', desc: 'Add and manage balances to accept payments with different currencies', icon: Wallet, to: '/balance' },
];
const setup: Entry[] = [
  { title: 'Payouts Approval Workflow', desc: 'Set and manage multi-level approval processes to review and approve payouts', icon: CircleArrowUp, to: '/settings/payout-approval' },
  { title: 'Developers', desc: 'Create API keys, authorize IP addresses to make API requests, and manage webhooks', icon: Code, to: '/settings/developers' },
];

function Grid({ title, items }: { title: string; items: Entry[] }) {
  return (
    <>
      <h2 className="section-title settings-h">{title}</h2>
      <div className="settings-grid">
        {items.map((e) => (
          <Link key={e.title} to={e.to} className="settings-card">
            <span className="settings-icon"><e.icon size={26} strokeWidth={1.4} /></span>
            <span>
              <span className="settings-title">{e.title}</span>
              <span className="settings-desc">{e.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}

function DevModeSection() {
  const { enabled, setEnabled, comments } = useDevMode();
  return (
    <>
      <h2 className="section-title settings-h">Dev Mode</h2>
      <div className="settings-card devmode-card">
        <span className="settings-icon"><Code size={26} strokeWidth={1.4} /></span>
        <span className="devmode-text">
          <span className="settings-title">Enable Dev Mode</span>
          <span className="settings-desc">
            When enabled, developers who open <code>/dev</code> can leave comments on any page and review all of them
            from a floating, draggable panel. {comments.length} comment{comments.length === 1 ? '' : 's'} saved.
          </span>
        </span>
        <button role="switch" aria-checked={enabled} aria-label="Enable Dev Mode" className={`switch lg ${enabled ? 'on' : ''}`} onClick={() => setEnabled(!enabled)}><i /></button>
      </div>
      {enabled && (
        <p className="devmode-hint">
          Dev Mode is on. Open <Link to="/dev" className="link" style={{ marginLeft: 0 }}>/dev</Link> to start commenting.
        </p>
      )}
    </>
  );
}

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" />
      <Grid title="Account" items={account} />
      <Grid title="Setup & Integration" items={setup} />
      <DevModeSection />
      <div className="version">Version: 1.259.1</div>
    </>
  );
}
