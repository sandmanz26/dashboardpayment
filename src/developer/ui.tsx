import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Copy, X } from 'lucide-react';

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

export function CopyButton({ text, label, className = '' }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return (
    <button type="button" className={`dv-copy ${className}`} aria-label={label ?? 'Copy'} title={label ?? 'Copy'}
      onClick={async (e) => { e.stopPropagation(); if (await copyText(text)) { setDone(true); window.clearTimeout(t.current); t.current = window.setTimeout(() => setDone(false), 1400); } }}>
      {done ? <Check size={14} /> : <Copy size={14} />}
      {label && <span>{done ? 'Copied' : label}</span>}
    </button>
  );
}

export function CodeBlock({ code, title, lang }: { code: string; title?: string; lang?: string }) {
  return (
    <div className="dv-code">
      <div className="dv-code-head">
        <span>{title ?? lang ?? ''}</span>
        <CopyButton text={code} label="Copy" />
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, width = 640 }: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode; width?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="dv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dv-modal" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={box} style={{ maxWidth: width }}>
        <header>
          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button className="dv-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        {children}
      </div>
    </div>
  );
}
