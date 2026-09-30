import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useDevMode } from '../dev/DevMode';

/** /dev — enters developer session when Dev Mode is enabled in Settings. */
export default function DevEntry() {
  const { enabled, activate } = useDevMode();
  useEffect(() => { if (enabled) activate(); }, [enabled, activate]);

  if (enabled) return <Navigate to="/" replace />;
  return (
    <>
      <PageHeader title="Dev Mode is off" />
      <p className="muted" style={{ marginTop: 32 }}>
        Dev Mode is disabled. Turn it on at <Link to="/secret" style={{ color: 'var(--blue)' }}>/secret</Link> to leave and review comments.
      </p>
    </>
  );
}
