import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusCards from '../components/StatusCards';
import EmptyState from '../components/EmptyState';

const items = [
  { key: 'All', label: 'All', desc: 'Show all subscriptions' },
  { key: 'Active', label: 'Active', desc: 'Show active plans' },
  { key: 'Requires Action', label: 'Requires Action', desc: 'Show plans requiring action' },
  { key: 'Inactive', label: 'Inactive', desc: 'Show plans that are inactive' },
];

export default function Subscriptions() {
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  return (
    <>
      <PageHeader title="Subscription" />
      <StatusCards items={items} value={status} onChange={setStatus} />
      <div className="toolbar tight">
        <div className="pills">
          {['Created Date', 'Status'].map((f) => <button key={f} className="pill">{f} <ChevronDown size={16} strokeWidth={1.5} /></button>)}
        </div>
        <div className="actions">
          <input className="plain-search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn primary"><Plus size={16} strokeWidth={1.8} />Create New</button>
        </div>
      </div>
      <EmptyState title="No subscriptions yet" text="Create your first subscription plan to get started." />
    </>
  );
}
