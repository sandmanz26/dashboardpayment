import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';

export default function Layout() {
  const ref = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => { ref.current?.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="app">
      <Sidebar />
      <main ref={ref} className="main">
        <div className="card"><Outlet /></div>
      </main>
      <ChatWidget />
    </div>
  );
}
