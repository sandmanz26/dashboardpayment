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
    <button type="button" className={`xds-icon-button-copy ${className}`} aria-label={label ?? 'Copy'} title={label ?? 'Copy'}
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
  // Keep the latest onClose in a ref so the effect below runs only on mount/unmount.
  // (Depending on onClose directly re-ran it on every parent render and stole focus from inputs.)
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    // Focus the dialog only if nothing inside it (e.g. an autoFocus input) already has focus.
    if (!box.current?.contains(document.activeElement)) box.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, []);
  return (
    <div className="xds-dialog-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="xds-dialog" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={box} style={{ maxWidth: width }}>
        <header>
          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button className="xds-icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        {children}
      </div>
    </div>
  );
}
