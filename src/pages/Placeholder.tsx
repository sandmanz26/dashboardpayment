import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const title = (path: string) =>
  path.split('/').filter(Boolean).pop()!
    .split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ') || 'Page';

export default function Placeholder() {
  const { pathname } = useLocation();
  return (
    <>
      <PageHeader title={title(pathname)} />
      <p className="muted">This page is not part of the replicated screens yet.</p>
    </>
  );
}
