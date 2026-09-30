import { useState } from 'react';
import { X } from 'lucide-react';

export default function ChatWidget() {
  const [showHint, setShowHint] = useState(true);
  return (
    <div className="chat">
      {showHint && (
        <div className="chat-hint">
          <button className="chat-close" onClick={() => setShowHint(false)} aria-label="Dismiss"><X size={16} /></button>
          <div className="chat-bubble">Hi. Need any help?</div>
        </div>
      )}
      <button className="chat-fab" aria-label="Open chat">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M5 3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-6l-4.2 3.6a.6.6 0 0 1-1-.46V17H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" /></svg>
      </button>
    </div>
  );
}
