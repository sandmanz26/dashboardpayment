import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, LogOut, MessageSquarePlus, MessageSquareText, X } from 'lucide-react';
import { commentsToText, useDevMode } from './DevMode';

const SIZE = 48;
const PANEL_W = 340;
const POS_KEY = 'dev.widgetPos';

interface Pos { x: number; y: number }
const clamp = (p: Pos, w = window.innerWidth, h = window.innerHeight): Pos => ({
  x: Math.min(Math.max(8, p.x), w - SIZE - 8),
  y: Math.min(Math.max(8, p.y), h - SIZE - 8),
});
const loadPos = (): Pos => {
  try {
    const v = JSON.parse(localStorage.getItem(POS_KEY) ?? 'null');
    if (v && typeof v.x === 'number' && typeof v.y === 'number') return clamp(v);
  } catch { /* ignore */ }
  return clamp({ x: window.innerWidth - SIZE - 24, y: 120 });
};

/** Floating, draggable dev toolbox: lists every comment and jumps to its page. */
export default function DevWidget({ placing, setPlacing }: { placing: boolean; setPlacing: (v: boolean) => void }) {
  const { active, comments, exit, setFocusId } = useDevMode();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pos, setPos] = useState<Pos>(loadPos);
  const [open, setOpen] = useState(false);
  const drag = useRef<{ dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);

  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!active) return null;

  const start = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button[data-nodrag]')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    if (d.moved) setPos(clamp({ x: e.clientX - d.dx, y: e.clientY - d.dy }));
  };
  const end = (toggleOnClick: boolean) => () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) { try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* ignore */ } }
    else if (toggleOnClick) setOpen((o) => !o);
  };

  const goTo = (id: string, path: string) => {
    setPlacing(false);
    if (path !== pathname) navigate(path);
    setFocusId(id);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([commentsToText(comments)], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'dev-comments.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // open the panel below the button when there is room, otherwise above; keep it inside the viewport
  const below = pos.y + SIZE + 12 + 200 < window.innerHeight;
  const panelLeft = Math.min(Math.max(8, pos.x + SIZE - PANEL_W), window.innerWidth - PANEL_W - 8);
  const panelStyle = below
    ? { left: panelLeft, top: pos.y + SIZE + 8, maxHeight: window.innerHeight - pos.y - SIZE - 24 }
    : { left: panelLeft, bottom: window.innerHeight - pos.y + 8, maxHeight: pos.y - 24 };

  const grouped = comments.reduce<Record<string, typeof comments>>((acc, c) => { (acc[c.path] ??= []).push(c); return acc; }, {});

  return (
    <>
      <button className={`dev-fab ${placing ? 'placing' : ''}`} style={{ left: pos.x, top: pos.y }} aria-label="Dev comments"
        onPointerDown={start} onPointerMove={move} onPointerUp={end(true)} onPointerCancel={end(false)}>
        <MessageSquareText size={20} />
        <span className="dev-count">{comments.length}</span>
      </button>

      {open && (
        <div className="dev-panel" style={panelStyle}>
          <div className="dev-panel-head" onPointerDown={start} onPointerMove={move} onPointerUp={end(false)} onPointerCancel={end(false)}>
            <b>Dev comments</b>
            <button data-nodrag onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="dev-panel-actions">
            <button className={`btn xs ${placing ? 'primary' : 'outline'}`} onClick={() => { setPlacing(!placing); if (!placing) setOpen(false); }}>
              <MessageSquarePlus size={13} />{placing ? 'Click on the page…' : 'Add comment'}
            </button>
            <button className="btn outline xs" onClick={download} disabled={!comments.length}><Download size={13} />.txt</button>
            <button className="btn outline xs" onClick={() => { exit(); setPlacing(false); }}><LogOut size={13} />Exit</button>
          </div>
          <div className="dev-list">
            {comments.length === 0 && <div className="dev-none">No comments yet. Press “Add comment” and click anywhere on a page.</div>}
            {Object.entries(grouped).map(([path, list]) => (
              <div key={path}>
                <div className="dev-path">{path}</div>
                {list.map((c) => (
                  <button key={c.id} className="dev-item" onClick={() => goTo(c.id, c.path)}>
                    <span className="di-meta"><b>{c.author}</b><span>{new Date(c.createdAt).toLocaleString()}</span></span>
                    <span className="di-text">{c.text}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
