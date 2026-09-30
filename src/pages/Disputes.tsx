import { useState } from 'react';
import { ChevronDown, CircleX, Download, Search, Settings } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusCards from '../components/StatusCards';
import EmptyState, { SearchIllustration } from '../components/EmptyState';

const items = [
  { key: 'All', label: 'All (0)' },
  { key: 'Action Required', label: 'Action Required (0)' },
  { key: 'Under Review', label: 'Under Review (0)' },
  { key: 'Closed', label: 'Closed (0)' },
];

export default function Disputes() {
  const [status, setStatus] = useState('Action Required');
  const [q, setQ] = useState('');
  return (
    <>
      <PageHeader title="Disputes">
        <button className="btn outline lg"><Settings size={16} strokeWidth={1.5} />Dispute Settings</button>
      </PageHeader>

      <StatusCards items={items} value={status} onChange={setStatus} />

      <div className="toolbar tight">
        <div className="pills">
          {['Created Date', 'Currency', 'Reason'].map((f) => <button key={f} className="pill">{f} <ChevronDown size={16} strokeWidth={1.5} /></button>)}
          {status !== 'All' && (
            <button className="pill" onClick={() => setStatus('All')}>
              Status: <span className="link">{status}</span><CircleX size={16} strokeWidth={1.4} />
            </button>
          )}
          <button className="pill">Channel <ChevronDown size={16} strokeWidth={1.5} /></button>
          <button className="reset" onClick={() => { setStatus('All'); setQ(''); }}>Reset</button>
        </div>
        <div className="actions">
          <label className="search-box">
            <Search size={16} strokeWidth={1.5} />
            <input placeholder="Search payment ID, reference ID, dispute ID" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <button className="btn outline"><Download size={16} strokeWidth={1.5} />Export</button>
        </div>
      </div>

      <EmptyState illustration={<SearchIllustration />} title="No dispute found" text="Try adjusting your search or filters." />
    </>
  );
}
