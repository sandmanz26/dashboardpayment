import type { ReactNode } from 'react';

export default function EmptyState({ title, text, illustration }: { title: string; text: string; illustration?: ReactNode }) {
  return (
    <div className="empty-state">
      {illustration}
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function SearchIllustration() {
  return (
    <svg width="150" height="175" viewBox="0 0 150 175" fill="none" aria-hidden>
      <rect x="4" y="6" width="112" height="146" rx="8" fill="#f1f3f8" />
      <rect x="18" y="24" width="60" height="6" rx="3" fill="#e0e4ee" />
      <rect x="18" y="44" width="40" height="6" rx="3" fill="#e0e4ee" />
      <rect x="18" y="64" width="34" height="6" rx="3" fill="#e0e4ee" />
      <rect x="18" y="84" width="34" height="6" rx="3" fill="#e0e4ee" />
      <rect x="18" y="104" width="34" height="6" rx="3" fill="#e0e4ee" />
      <circle cx="82" cy="90" r="34" fill="#f8f9fc" fillOpacity=".7" stroke="#d6dae6" strokeWidth="7" />
      <path d="m95 150 32 30" stroke="#0b5fff" strokeWidth="14" strokeLinecap="round" transform="translate(0 -30)" />
    </svg>
  );
}
