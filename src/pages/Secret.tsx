import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useDevMode } from '../dev/DevMode';

/** Hidden page (/secret): not linked from anywhere in the UI. */
export default function Secret() {
  const { enabled, setEnabled, comments } = useDevMode();
  return (
    <>
      <PageHeader title="Secret" />
      <h2 className="section-title settings-h">Dev Mode</h2>
      <div className="settings-card devmode-card">
        <span className="settings-icon"><Code size={26} strokeWidth={1.4} /></span>
        <span className="devmode-text">
          <span className="settings-title">Enable Dev Mode</span>
          <span className="settings-desc">
            When enabled, developers who open <code>/dev</code> can leave comments on any page and review all of them
            from a floating, draggable panel. {comments.length} comment{comments.length === 1 ? '' : 's'} saved.
          </span>
        </span>
        <button role="switch" aria-checked={enabled} aria-label="Enable Dev Mode" className={`switch lg ${enabled ? 'on' : ''}`} onClick={() => setEnabled(!enabled)}><i /></button>
      </div>
      {enabled && (
        <p className="devmode-hint">
          Dev Mode is on. Open <Link to="/dev" className="link" style={{ marginLeft: 0 }}>/dev</Link> to start commenting.
        </p>
      )}
    </>
  );
}
