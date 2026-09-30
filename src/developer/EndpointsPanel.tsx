import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import EndpointModal from './EndpointModal';
import type { SavedEndpoint } from './EndpointModal';

const STORE = 'dev.endpoints';
const load = (): SavedEndpoint[] => { try { const v = JSON.parse(localStorage.getItem(STORE) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };

export default function EndpointsPanel() {
  const [list, setList] = useState<SavedEndpoint[]>(load);
  const [adding, setAdding] = useState(false);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(list)); } catch { /* ignore */ } }, [list]);

  return (
    <section className="dv-panel">
      <header>
        <div><h3>Endpoints</h3><p className="dv-muted">One URL can receive many events. Each endpoint shows its own health.</p></div>
        <button className="dv-btn primary" onClick={() => setAdding(true)}><Plus size={14} />Add endpoint</button>
      </header>
      {list.length === 0 ? (
        <div className="dv-empty"><p><b>No endpoints yet</b></p><p className="dv-muted">Add one to choose events and preview payloads, or keep using the per-event URLs below.</p></div>
      ) : (
        <table className="dv-table">
          <thead><tr><th>Endpoint</th><th>Events</th><th>Last delivery</th><th /></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td><div>{e.name}</div><div className="mono dv-sub">{e.url}</div></td>
                <td>{e.events.length} event{e.events.length === 1 ? '' : 's'}</td>
                <td>{e.lastTest ? <span className="ev-badge ok">Test · 200 · {e.lastTest.ms} ms</span> : <span className="dv-muted">No deliveries yet</span>}</td>
                <td className="right"><button className="dv-danger" onClick={() => setList((l) => l.filter((x) => x.id !== e.id))}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {adding && <EndpointModal onClose={() => setAdding(false)} onSave={(e) => { setList((l) => [...l, e]); setAdding(false); }} />}
    </section>
  );
}
