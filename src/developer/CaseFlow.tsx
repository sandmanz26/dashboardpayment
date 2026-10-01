/** Linear workflow diagram for a Try case: request → processing → one node per outcome. */
export type NodeState = 'todo' | 'next' | 'done' | 'bad' | 'locked';
export interface FlowStep { id: string; label: string; sub?: string }
export interface FlowOutcome { id: string; label: string; tone: 'ok' | 'bad' }

const W = 168, H = 56, GAP = 38;

export default function CaseFlow({ steps, outcomes, states, active, onPick }: {
  steps: FlowStep[];
  outcomes: FlowOutcome[];
  states: Record<string, NodeState>;
  active: string | null;
  onPick: (id: string) => void;
}) {
  const rowY = 16;
  const outY = 140;
  const width = Math.max(steps.length, outcomes.length) * (W + GAP) - GAP;
  const forkX = (steps.length - 1) * (W + GAP) + W / 2;
  const outX = (i: number) => i * (width - W) / Math.max(outcomes.length - 1, 1) + W / 2;
  const cls = (id: string) => `${states[id] ?? 'todo'}${active === id ? ' sel' : ''}`;

  const node = (id: string, label: string, sub: string | undefined, x: number, extra: string) => (
    <g key={id} className={`cf-node ${extra} ${cls(id)}`}
      role="button" tabIndex={0} aria-pressed={active === id} aria-label={`${label}${sub ? ` — ${sub}` : ''}`}
      onClick={() => onPick(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(id); } }}>
      <rect x={x} y={extra === 'step' ? rowY : outY} width={W} height={H} rx="9" />
      <text className="t1" x={x + W / 2} y={(extra === 'step' ? rowY : outY) + (sub ? 24 : 33)} textAnchor="middle">{label}</text>
      {sub && <text className="t2" x={x + W / 2} y={rowY + 40} textAnchor="middle">{sub}</text>}
    </g>
  );

  return (
    <svg className="cf" style={{ maxWidth: width }} viewBox={`0 0 ${width} ${outY + H + 24}`} role="group" aria-label="Workflow for this case">
      <defs>
        <marker id="cf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9z" fill="context-stroke" />
        </marker>
      </defs>

      {steps.slice(0, -1).map((s, i) => (
        <path key={s.id} className={`cf-edge ${states[steps[i + 1].id] === 'locked' ? '' : 'on'}`}
          d={`M${i * (W + GAP) + W} ${rowY + H / 2} H${(i + 1) * (W + GAP) - 2}`} markerEnd="url(#cf-arrow)" />
      ))}

      {outcomes.map((o, i) => (
        <path key={o.id} className={`cf-edge ${states[o.id] === 'done' || states[o.id] === 'bad' ? 'on' : ''}`}
          d={`M${forkX} ${rowY + H} V${(rowY + H + outY) / 2} H${outX(i)} V${outY - 2}`} markerEnd="url(#cf-arrow)" />
      ))}

      {steps.map((s, i) => node(s.id, s.label, s.sub, i * (W + GAP), 'step'))}
      {outcomes.map((o, i) => node(o.id, o.label, undefined, outX(i) - W / 2, `out ${o.tone}`))}
    </svg>
  );
}
