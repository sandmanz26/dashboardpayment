/** Linear workflow diagram for a Try case: request → processing → one node per outcome.
 *  Longer flows wrap: `perRow` caps how many steps share a row, so a six-step case stays
 *  readable at 1:1 instead of being scaled down to fit. */
export type NodeState = 'todo' | 'next' | 'done' | 'bad' | 'locked';
export interface FlowStep { id: string; label: string; sub?: string }
export interface FlowOutcome { id: string; label: string; tone: 'ok' | 'bad' }

const W = 168, H = 56, GAP = 38, VGAP = 44;

export default function CaseFlow({ steps, outcomes, states, active, onPick, perRow }: {
  steps: FlowStep[];
  outcomes: FlowOutcome[];
  states: Record<string, NodeState>;
  active: string | null;
  onPick: (id: string) => void;
  /** Steps per row. Defaults to one row for every step. */
  perRow?: number;
}) {
  const cols = Math.max(1, Math.min(perRow ?? steps.length, steps.length));
  const colX = (i: number) => (i % cols) * (W + GAP);
  const rowOf = (i: number) => Math.floor(i / cols);
  const rowY = (r: number) => 16 + r * (H + VGAP);
  const stepRows = Math.ceil(steps.length / cols);
  const lastBottom = rowY(stepRows - 1) + H;
  const outY = lastBottom + 68;

  const width = Math.max(cols, outcomes.length) * (W + GAP) - GAP;
  const forkX = colX(steps.length - 1) + W / 2;
  const outX = (i: number) => i * (width - W) / Math.max(outcomes.length - 1, 1) + W / 2;
  const cls = (id: string) => `${states[id] ?? 'todo'}${active === id ? ' sel' : ''}`;

  const node = (id: string, label: string, sub: string | undefined, x: number, y: number, extra: string) => (
    <g key={id} className={`cf-node ${extra} ${cls(id)}`}
      role="button" tabIndex={0} aria-pressed={active === id} aria-label={`${label}${sub ? ` — ${sub}` : ''}`}
      onClick={() => onPick(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(id); } }}>
      <rect x={x} y={y} width={W} height={H} rx="9" />
      <text className="t1" x={x + W / 2} y={y + (sub ? 24 : 33)} textAnchor="middle">{label}</text>
      {sub && <text className="t2" x={x + W / 2} y={y + 40} textAnchor="middle">{sub}</text>}
    </g>
  );

  return (
    <svg className="cf" style={{ maxWidth: width }} viewBox={`0 0 ${width} ${outY + H + 24}`} role="group" aria-label="Workflow for this case">
      <defs>
        <marker id="cf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9z" fill="context-stroke" />
        </marker>
      </defs>

      {steps.slice(0, -1).map((s, i) => {
        const on = states[steps[i + 1].id] === 'locked' ? '' : 'on';
        const r = rowOf(i);
        // Same row: a straight arrow. Across rows: drop into the gap, run back, then down.
        const d = r === rowOf(i + 1)
          ? `M${colX(i) + W} ${rowY(r) + H / 2} H${colX(i + 1) - 2}`
          : `M${colX(i) + W / 2} ${rowY(r) + H} V${rowY(r) + H + VGAP / 2} H${colX(i + 1) + W / 2} V${rowY(r + 1) - 2}`;
        return <path key={s.id} className={`cf-edge ${on}`} d={d} markerEnd="url(#cf-arrow)" />;
      })}

      {outcomes.map((o, i) => (
        <path key={o.id} className={`cf-edge ${states[o.id] === 'done' || states[o.id] === 'bad' ? 'on' : ''}`}
          d={`M${forkX} ${lastBottom} V${(lastBottom + outY) / 2} H${outX(i)} V${outY - 2}`} markerEnd="url(#cf-arrow)" />
      ))}

      {steps.map((s, i) => node(s.id, s.label, s.sub, colX(i), rowY(rowOf(i)), 'step'))}
      {outcomes.map((o, i) => node(o.id, o.label, undefined, outX(i) - W / 2, outY, `out ${o.tone}`))}
    </svg>
  );
}
