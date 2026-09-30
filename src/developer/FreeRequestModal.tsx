import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { collectionFor, curl, downloadJson } from './postman';
import type { Endpoint } from './postman';
import { CodeBlock, Modal } from './ui';

/** Leave the guided flow: edit the exact request, copy it as cURL or take it to Postman. Does not send anything. */
export default function FreeRequestModal({ base, onClose }: { base: Endpoint; onClose: () => void }) {
  const [path, setPath] = useState(base.path);
  const [body, setBody] = useState(base.body ? JSON.stringify(base.body, null, 2) : '');

  const parsed = useMemo(() => {
    if (!body.trim()) return { ok: true as const, value: undefined };
    try { return { ok: true as const, value: JSON.parse(body) as unknown }; } catch { return { ok: false as const }; }
  }, [body]);

  const ep: Endpoint = { ...base, path, body: parsed.ok ? parsed.value : base.body };

  return (
    <Modal title="Free request" subtitle="Edit anything, then copy it or take it to Postman. Nothing is sent from here." onClose={onClose} width={680}>
      <div className="dv-form">
        <label>Request
          <div className="dv-reqline"><em className={`m ${base.method}`}>{base.method}</em><code>https://api.xendit.co</code>
            <input value={path} onChange={(e) => setPath(e.target.value)} aria-label="Path" /></div>
        </label>
        {base.body !== undefined && (
          <label>Body (JSON)
            <textarea className="dv-ta" rows={10} value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false} aria-invalid={!parsed.ok} />
            {!parsed.ok && <span className="dv-err">This isn’t valid JSON. Fix the syntax to update the cURL below.</span>}
          </label>
        )}
        <CodeBlock title="cURL" code={curl(ep)} />
        <div className="dv-form-foot">
          <button className="dv-btn" onClick={() => downloadJson('xendit-free-request.postman_collection.json', collectionFor([ep], `Xendit – ${base.name}`))}>
            <Download size={14} />Download for Postman
          </button>
          <button className="dv-btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </Modal>
  );
}
