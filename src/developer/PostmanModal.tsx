import { useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { BASE_URL, buildCollection, buildEnvironment, curl, downloadJson, endpoints, pretty } from './postman';
import { CodeBlock, Modal } from './ui';

export default function PostmanModal({ onClose }: { onClose: () => void }) {
  const [id, setId] = useState(endpoints[0].id);
  const [step, setStep] = useState({ col: false, env: false });
  const ep = endpoints.find((e) => e.id === id)!;

  return (
    <Modal title="Try on Postman" subtitle="Import a ready-made collection and send your first request in under a minute." onClose={onClose} width={720}>
      <div className="xds-dialog-body">
        <ol className="dv-steps">
          <li>
            <span className="n">1</span>
            <div className="grow">
              <b>Download the collection and environment</b>
              <p>Four sample requests — balance, transactions, invoices and payouts — using <code>{'{{base_url}}'}</code> and <code>{'{{secret_key}}'}</code>.</p>
              <div className="row">
                <button className="xds-button" onClick={() => { downloadJson('xendit-api.postman_collection.json', buildCollection()); setStep((s) => ({ ...s, col: true })); }}>
                  <Download size={14} />Collection{step.col && ' ✓'}
                </button>
                <button className="xds-button" onClick={() => { downloadJson('xendit-test.postman_environment.json', buildEnvironment()); setStep((s) => ({ ...s, env: true })); }}>
                  <Download size={14} />Environment{step.env && ' ✓'}
                </button>
              </div>
            </div>
          </li>
          <li>
            <span className="n">2</span>
            <div className="grow">
              <b>Import both files</b>
              <p>In Postman choose <code>File → Import</code>, drop the two files, then select <code>Xendit – UIByte (test)</code> as the active environment.</p>
              <a className="dv-link" href="https://www.postman.com/interstellar-shuttle-5542/xendit/folder/bbnmolt/general?sideView=agentMode" target="_blank" rel="noreferrer">Open the Xendit collection on Postman <ExternalLink size={13} /></a>
            </div>
          </li>
          <li>
            <span className="n">3</span>
            <div className="grow">
              <b>Add your secret key</b>
              <p>Paste a test-mode secret key into the <code>secret_key</code> variable. Requests authenticate with HTTP Basic — the key is the username, the password is empty.</p>
            </div>
          </li>
        </ol>

        <div className="dv-try">
          <div className="dv-try-head">
            <h3>Or start from the terminal</h3>
            <span className="xds-tag-plain">Base URL <code>{BASE_URL}</code></span>
          </div>
          <div className="dv-seg" role="tablist">
            {endpoints.map((e) => (
              <button key={e.id} role="tab" aria-selected={e.id === id} className={e.id === id ? 'on' : ''} onClick={() => setId(e.id)}>
                <em className={`m ${e.method}`}>{e.method}</em>{e.name}
              </button>
            ))}
          </div>
          <p className="dv-muted">{ep.description}</p>
          <CodeBlock title="cURL" code={curl(ep)} />
          <CodeBlock title="Sample response · 200" code={pretty(ep.response)} />
        </div>
      </div>
    </Modal>
  );
}
