import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useDevMode } from './DevMode';

/** Rendered inside the page card: shows pins for the current route and captures new comments. */
export default function CommentLayer({ placing, onDone }: { placing: boolean; onDone: () => void }) {
  const { active, comments, addComment, removeComment, author, setAuthor, focusId, setFocusId } = useDevMode();
  const { pathname } = useLocation();
  const layer = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState('');
  const [name, setName] = useState(author);
  const [open, setOpen] = useState<string | null>(null);

  const here = comments.filter((c) => c.path === pathname);

  useEffect(() => { setDraft(null); setOpen(null); }, [pathname]);

  // jump to a comment picked from the floating list
  useEffect(() => {
    if (!focusId) return;
    const c = comments.find((x) => x.id === focusId);
    if (!c || c.path !== pathname) return;
    const el = layer.current?.querySelector<HTMLElement>(`[data-pin="${focusId}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setOpen(focusId);
    const t = setTimeout(() => setFocusId(null), 2200);
    return () => clearTimeout(t);
  }, [focusId, pathname, comments, setFocusId]);

  useEffect(() => { if (!placing) setDraft(null); }, [placing]);
  useEffect(() => setName(author), [author]);

  if (!active) return null;

  const place = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setDraft({ x: (e.clientX - r.left) / r.width, y: e.clientY - r.top });
    setText('');
  };

  const save = () => {
    if (!draft || !text.trim()) return;
    const who = name.trim() || 'Developer';
    setAuthor(who);
    const c = addComment({ path: pathname, x: draft.x, y: draft.y, text: text.trim(), author: who });
    setDraft(null); setText(''); onDone(); setOpen(c.id);
  };

  return (
    <div ref={layer} className="dev-layer" data-dev-layer>
      {placing && <div className="dev-capture" onClick={place} />}
      {here.map((c, i) => (
        <div key={c.id} data-pin={c.id} className={`dev-pin ${focusId === c.id ? 'flash' : ''}`} style={{ left: `${c.x * 100}%`, top: c.y }}>
          <button className="pin-dot" onClick={() => setOpen(open === c.id ? null : c.id)} aria-label={`Comment ${i + 1}`}>{i + 1}</button>
          {open === c.id && (
            <div className={`pin-pop ${c.x > 0.6 ? 'left' : ''}`}>
              <div className="pop-head"><b>{c.author}</b><span>{new Date(c.createdAt).toLocaleString()}</span></div>
              <p>{c.text}</p>
              <button className="pop-del" onClick={() => removeComment(c.id)}><Trash2 size={12} />Delete</button>
            </div>
          )}
        </div>
      ))}
      {draft && (
        <div className={`dev-pin draft`} style={{ left: `${draft.x * 100}%`, top: draft.y }}>
          <span className="pin-dot"><MessageSquare size={12} /></span>
          <div className={`pin-pop composer ${draft.x > 0.6 ? 'left' : ''}`}>
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea autoFocus placeholder="Leave a comment…" value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); }} />
            <div className="pop-actions">
              <button className="btn outline xs" onClick={() => setDraft(null)}>Cancel</button>
              <button className="btn primary xs" disabled={!text.trim()} onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
