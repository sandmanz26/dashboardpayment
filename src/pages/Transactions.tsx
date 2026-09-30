import { useMemo, useState } from 'react';
import { ChevronDown, Download, Search, Settings, ArrowLeft, ArrowRight, Ellipsis } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { fmt, transactions } from '../data/mock';

const tabs = ['All', 'Payment', 'Payout', 'Refund', 'Others'] as const;
const statuses = ['All', 'Successful', 'Failed'] as const;
const filters = ['Date & Time', 'Status', 'Currency', 'Type', 'Category', 'More Filters'];

const formatDate = (iso: string) => {
  const fmtPart = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', ...o }).format(new Date(iso));
  const day = fmtPart({ day: '2-digit' });
  const month = fmtPart({ month: 'short' });
  const year = fmtPart({ year: 'numeric' });
  const time = fmtPart({ hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day} ${month} ${year}, ${time}`;
};

export default function Transactions() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('All');
  const [status, setStatus] = useState<(typeof statuses)[number]>('All');
  const [query, setQuery] = useState('');
  const [applied, setApplied] = useState('');
  const [perPage, setPerPage] = useState(20);

  const rows = useMemo(() => transactions.filter((t) =>
    (tab === 'All' || t.category === tab) &&
    (status === 'All' || t.status === status) &&
    (!applied || `${t.reference} ${t.type} ${t.amount}`.toLowerCase().includes(applied.toLowerCase())),
  ), [tab, status, applied]);

  return (
    <>
      <PageHeader title="Transactions">
        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </PageHeader>

      <div className="status-cards">
        {statuses.map((s) => (
          <button key={s} className={`status-card ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s}</button>
        ))}
      </div>

      <form className="search" onSubmit={(e) => { e.preventDefault(); setApplied(query); }}>
        <input placeholder="Search transaction" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit" aria-label="Search"><Search size={16} strokeWidth={2} /></button>
      </form>

      <div className="toolbar">
        <div className="pills">
          {filters.map((f) => <button key={f} className="pill">{f} <ChevronDown size={16} strokeWidth={1.5} /></button>)}
        </div>
        <div className="actions">
          <button className="btn outline"><Settings size={16} strokeWidth={1.5} />Customize Columns</button>
          <button className="btn outline"><Download size={16} strokeWidth={1.5} />Export</button>
        </div>
      </div>

      <table className="table tx">
        <colgroup>{[16.3, 12, 16, 12.5, 16, 23.5, 3.7].map((w, i) => <col key={i} style={{ width: `${w}%` }} />)}</colgroup>
        <thead>
          <tr>
            <th>Created</th><th>Status</th><th className="amount">Amount</th><th>Type</th><th>Channel Name</th><th>Reference</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, perPage).map((t) => (
            <tr key={t.id}>
              <td>{formatDate(t.createdAt)}</td>
              <td><span className={`badge ${t.status === 'Successful' ? 'green' : 'red'}`}>{t.status}</span></td>
              <td className="amount"><b className="amt">{fmt(t.amount, 2)}</b><span className="cur-tag">{t.currency}</span></td>
              <td className="muted">{t.type}</td>
              <td>{t.channel}</td>
              <td className="muted ref" title={t.reference}>{t.reference.slice(0, 27)}...</td>
              <td className="right"><button className="icon-btn" aria-label="Actions"><Ellipsis size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty">No transactions found</div>}

      <div className="pager">
        <span>Showing
          <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
            {[10, 20, 50, 100].map((n) => <option key={n}>{n}</option>)}
          </select>
          per page &nbsp;·&nbsp; Date and time shown are in GMT +07:00
        </span>
        <span className="pager-nav">
          <button disabled><ArrowLeft size={14} /> Previous</button>
          <button disabled>Next <ArrowRight size={14} /></button>
        </span>
      </div>
    </>
  );
}
