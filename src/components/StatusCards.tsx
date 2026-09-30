export interface StatusCardItem { key: string; label: string; desc?: string }

export default function StatusCards<T extends string>({ items, value, onChange }: {
  items: StatusCardItem[]; value: T; onChange: (k: T) => void;
}) {
  return (
    <div className="status-cards cols" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((it) => (
        <button key={it.key} className={`status-card ${it.desc ? 'has-desc' : ''} ${value === it.key ? 'active' : ''}`} onClick={() => onChange(it.key as T)}>
          <span className="sc-title">{it.label}</span>
          {it.desc && <span className="sc-desc">{it.desc}</span>}
        </button>
      ))}
    </div>
  );
}
