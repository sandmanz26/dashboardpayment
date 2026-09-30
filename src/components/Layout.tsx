import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';
import CommentLayer from '../dev/CommentLayer';
import DevWidget from '../dev/DevWidget';

export default function Layout() {
  const ref = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const [placing, setPlacing] = useState(false);

  useEffect(() => { ref.current?.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="app">
      <Sidebar />
      <main ref={ref} className="main">
        <div className="card"><Outlet /><CommentLayer placing={placing} onDone={() => setPlacing(false)} /></div>
      </main>
      <ChatWidget />
      <DevWidget placing={placing} setPlacing={setPlacing} />
    </div>
  );
}
