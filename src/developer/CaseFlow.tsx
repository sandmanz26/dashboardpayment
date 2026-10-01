/** Small linear workflow diagram for a Try case: request → processing → one node per outcome. */
export interface FlowStep { label: string; sub?: string }
export interface FlowOutcome { id: string; label: string; tone: 'ok' | 'bad' }

const W = 168, H = 56, GAP = 38;

export default function CaseFlow({ steps, outcomes, active, onPick }: {
  steps: FlowStep[]; outcomes: FlowOutcome[]; active: string | null; onPick?: (id: string) => void;
}) {
  const rowY = 16;
  const outY = 140;
  const width = Math.max(steps.length, outcomes.length) * (W + GAP) - GAP;
  const lastX = (steps.length - 1) * (W + GAP);
  const forkX = lastX + W / 2;

  return (
    <svg className="cf" style={{ maxWidth: width }} viewBox={`0 0 ${width} ${outY + H + 24}`} role="group" aria-label="Workflow for this case">
      <defs>
        <marker id="cf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9z" fill="context-stroke" />
        </marker>
      </defs>

      {steps.slice(0, -1).map((_, i) => (
        <path key={i} className="cf-edge" d={`M${i * (W + GAP) + W} ${rowY + H / 2} H${(i + 1) * (W + GAP) - 2}`} markerEnd="url(#cf-arrow)" />
      ))}

      {outcomes.map((o, i) => {
        const x = i * (width - W) / Math.max(outcomes.length - 1, 1) + W / 2;
        return (
          <g key={`e-${o.id}`} className={`cf-edge-g ${active === o.id ? 'on' : ''} ${o.tone}`}>
            <path className="cf-edge" d={`M${forkX} ${rowY + H} V${(rowY + H + outY) / 2} H${x} V${outY - 2}`} markerEnd="url(#cf-arrow)" />
          </g>
        );
      })}

      {steps.map((s, i) => (
        <g key={s.label} className="cf-node step">
          <rect x={i * (W + GAP)} y={rowY} width={W} height={H} rx="9" />
          <text className="t1" x={i * (W + GAP) + W / 2} y={s.sub ? rowY + 24 : rowY + 33} textAnchor="middle">{s.label}</text>
          {s.sub && <text className="t2" x={i * (W + GAP) + W / 2} y={rowY + 40} textAnchor="middle">{s.sub}</text>}
        </g>
      ))}

      {outcomes.map((o, i) => {
        const cx = i * (width - W) / Math.max(outcomes.length - 1, 1) + W / 2;
        return (
          <g key={o.id} className={`cf-node out ${o.tone} ${active === o.id ? 'on' : ''}`}
            role={onPick ? 'button' : undefined} tabIndex={onPick ? 0 : undefined}
            aria-pressed={onPick ? active === o.id : undefined} aria-label={o.label}
            onClick={() => onPick?.(o.id)}
            onKeyDown={(e) => { if (onPick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPick(o.id); } }}>
            <rect x={cx - W / 2} y={outY} width={W} height={H} rx="9" />
            <text className="t1" x={cx} y={outY + 33} textAnchor="middle">{o.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
