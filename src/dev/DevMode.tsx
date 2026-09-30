import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface DevComment {
  id: string;
  path: string;      // route the comment belongs to
  x: number;         // 0..1 of the page card width
  y: number;         // px from the top of the page card
  text: string;
  author: string;
  createdAt: string; // ISO
}

interface Ctx {
  enabled: boolean;              // Dev Mode switch in Settings
  setEnabled: (v: boolean) => void;
  active: boolean;               // this tab entered via /dev
  activate: () => void;
  exit: () => void;
  comments: DevComment[];
  addComment: (c: Omit<DevComment, 'id' | 'createdAt'>) => DevComment;
  removeComment: (id: string) => void;
  author: string;
  setAuthor: (a: string) => void;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
}

const K = { enabled: 'dev.enabled', comments: 'dev.comments', author: 'dev.author', active: 'dev.active' };

const read = (store: Storage | undefined, key: string): string | null => {
  try { return store?.getItem(key) ?? null; } catch { return null; }
};
const write = (store: Storage | undefined, key: string, v: string | null) => {
  try { v === null ? store?.removeItem(key) : store?.setItem(key, v); } catch { /* storage unavailable */ }
};
const parseComments = (raw: string | null): DevComment[] => {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch { return []; }
};

const DevContext = createContext<Ctx | null>(null);
export const useDevMode = () => {
  const c = useContext(DevContext);
  if (!c) throw new Error('useDevMode must be used inside DevModeProvider');
  return c;
};

/** Human-readable plain-text export of all comments. */
export function commentsToText(list: DevComment[]): string {
  return list
    .map((c, i) => `#${i + 1} [${c.path}] ${c.author} @ ${c.createdAt}\n${c.text}\n`)
    .join('\n');
}

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(() => read(localStorage, K.enabled) === '1');
  const [active, setActive] = useState(() => read(sessionStorage, K.active) === '1');
  const [comments, setComments] = useState<DevComment[]>(() => parseComments(read(localStorage, K.comments)));
  const [author, setAuthorState] = useState(() => read(localStorage, K.author) ?? '');
  const [focusId, setFocusId] = useState<string | null>(null);

  // keep other tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === K.comments) setComments(parseComments(e.newValue));
      if (e.key === K.enabled) setEnabledState(e.newValue === '1');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = (list: DevComment[]) => write(localStorage, K.comments, JSON.stringify(list));

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    write(localStorage, K.enabled, v ? '1' : '0');
    if (!v) { setActive(false); write(sessionStorage, K.active, null); }
  }, []);

  const activate = useCallback(() => { setActive(true); write(sessionStorage, K.active, '1'); }, []);
  const exit = useCallback(() => { setActive(false); write(sessionStorage, K.active, null); }, []);

  const addComment: Ctx['addComment'] = useCallback((c) => {
    const full: DevComment = { ...c, id: `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString() };
    setComments((prev) => { const next = [...prev, full]; persist(next); return next; });
    return full;
  }, []);

  const removeComment = useCallback((id: string) => {
    setComments((prev) => { const next = prev.filter((c) => c.id !== id); persist(next); return next; });
  }, []);

  const setAuthor = useCallback((a: string) => { setAuthorState(a); write(localStorage, K.author, a); }, []);

  const value = useMemo(() => ({
    enabled, setEnabled, active, activate, exit, comments, addComment, removeComment, author, setAuthor, focusId, setFocusId,
  }), [enabled, setEnabled, active, activate, exit, comments, addComment, removeComment, author, setAuthor, focusId]);

  return <DevContext.Provider value={value}>{children}</DevContext.Provider>;
}
