/** Interactive flowchart for the Try flow. Pure SVG; every node is a keyboard-operable button. */
export type NodeState = 'todo' | 'next' | 'active' | 'done' | 'warn' | 'bad' | 'locked';
export type NodeId = 'receiver' | 'invoice' | 'pay' | 'send' | 'reply' | 'completed' | 'retry' | 'timeout' | 'resend';

interface NodeDef { id: NodeId; x: number; y: number; w: number; h: number; title: string; sub?: string; shape?: 'diamond' }

const NODES: NodeDef[] = [
  { id: 'receiver', x: 10, y: 30, w: 170, h: 64, title: '1 · Receiver', sub: 'Pick how it replies' },
  { id: 'invoice', x: 215, y: 30, w: 170, h: 64, title: '2 · Create invoice', sub: 'POST /v2/invoices' },
  { id: 'pay', x: 420, y: 30, w: 170, h: 64, title: '3 · Simulate payment', sub: 'Invoice becomes PAID' },
  { id: 'send', x: 625, y: 30, w: 170, h: 64, title: '4 · Webhook sent', sub: 'To your receiver' },
  { id: 'reply', x: 830, y: 17, w: 160, h: 90, title: 'Reply?', shape: 'diamond' },
  { id: 'completed', x: 830, y: 230, w: 160, h: 64, title: 'Completed', sub: 'Any 2xx reply' },
  { id: 'retry', x: 640, y: 230, w: 170, h: 64, title: 'Retry automatically', sub: '6 retries, 15 min–24 h' },
  { id: 'timeout', x: 420, y: 230, w: 170, h: 64, title: 'Timeout', sub: 'Not retried automatically' },
  { id: 'resend', x: 215, y: 230, w: 170, h: 64, title: 'Resend manually', sub: 'Recorded with user + time' },
];

interface EdgeDef { from: NodeId; d: string; label?: { x: number; y: number; t: string } }
const EDGES: EdgeDef[] = [
  { from: 'receiver', d: 'M180 62 H213' },
  { from: 'invoice', d: 'M385 62 H418' },
  { from: 'pay', d: 'M590 62 H623' },
  { from: 'send', d: 'M795 62 H828' },
  { from: 'reply', d: 'M910 107 V228', label: { x: 918, y: 172, t: '2xx' } },
  { from: 'reply', d: 'M890 96 V190 H725 V228', label: { x: 808, y: 183, t: 'non-2xx' } },
  { from: 'reply', d: 'M870 85 V160 H505 V228', label: { x: 690, y: 153, t: 'no reply in 30 s' } },
  { from: 'timeout', d: 'M418 262 H387' },
  { from: 'resend', d: 'M300 228 V130 H660 V96', label: { x: 480, y: 123, t: 'sent again' } },
];

const LIVE: NodeState[] = ['done', 'active', 'warn', 'bad'];

export default function TryDiagram({ states, selected, onSelect }: {
  states: Record<NodeId, NodeState>; selected: NodeId | null; onSelect: (id: NodeId) => void;
}) {
  return (
    <svg className="tf" viewBox="0 0 1000 320" role="group" aria-label="Payment and webhook flow. Select a step to try it.">
      <defs>
        <marker id="tf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9z" fill="context-stroke" />
        </marker>
      </defs>

      {EDGES.map((e, i) => (
        <g key={i} className={`tf-edge ${LIVE.includes(states[e.from]) ? 'on' : ''}`}>
          <path d={e.d} markerEnd="url(#tf-arrow)" />
          {e.label && <text x={e.label.x} y={e.label.y}>{e.label.t}</text>}
        </g>
      ))}

      {NODES.map((n) => {
        const st = states[n.id];
        const cx = n.x + n.w / 2;
        const cy = n.y + n.h / 2;
        return (
          <g
            key={n.id}
            className={`tf-node ${st} ${selected === n.id ? 'sel' : ''}`}
            role="button" tabIndex={0} aria-pressed={selected === n.id} aria-disabled={st === 'locked'}
            aria-label={`${n.title}${n.sub ? ` — ${n.sub}` : ''}${st === 'locked' ? ' (locked)' : ''}`}
            onClick={() => onSelect(n.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(n.id); } }}
          >
            {n.shape === 'diamond'
              ? <path className="shape" d={`M${n.x} ${cy} L${cx} ${n.y} L${n.x + n.w} ${cy} L${cx} ${n.y + n.h} Z`} />
              : <rect className="shape" x={n.x} y={n.y} width={n.w} height={n.h} rx="10" />}
            <text className="t1" x={cx} y={n.sub ? cy - 4 : cy + 5} textAnchor="middle">{n.title}</text>
            {n.sub && <text className="t2" x={cx} y={cy + 15} textAnchor="middle">{n.sub}</text>}
          </g>
        );
      })}
    </svg>
  );
}
