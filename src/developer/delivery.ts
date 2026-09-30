/**
 * Webhook delivery simulator used by the "Try" flow.
 *
 * From Xendit docs (per the project handoff):
 *  - any 2xx response = success
 *  - no response within 30 s = Timeout; events in Timeout are NOT retried automatically
 *  - otherwise retries at 15 min, 1 h, 3 h, 6 h, 12 h, 24 h (six retries)
 *  - manual resend is recorded with user and time
 * Assumed (verify before relying on it): each interval is measured from the previous attempt.
 */
export type Behaviour = 'ok' | 'error' | 'silent';
export type Status = 'Completed' | 'Pending' | 'Failed' | 'Timeout';

export const RETRY_S = [15 * 60, 3600, 3 * 3600, 6 * 3600, 12 * 3600, 24 * 3600];
export const TIMEOUT_S = 30;

export interface Attempt { n: number; at: number; behaviour: Behaviour; manual: boolean; code: number | null; ms: number }
export interface Delivery { attempts: Attempt[] }

export const behaviourLabel: Record<Behaviour, string> = {
  ok: 'Reply 200',
  error: 'Reply 500',
  silent: 'Do not reply',
};

export function addAttempt(d: Delivery, behaviour: Behaviour, at: number, manual: boolean): Delivery {
  const attempt: Attempt = {
    n: d.attempts.length + 1, at, behaviour, manual,
    code: behaviour === 'ok' ? 200 : behaviour === 'error' ? 500 : null,
    ms: behaviour === 'ok' ? 118 : behaviour === 'error' ? 184 : TIMEOUT_S * 1000,
  };
  return { attempts: [...d.attempts, attempt] };
}

export interface Summary { status: Status; nextAt: number | null; retriesLeft: number; note: string }

export function summarise(d: Delivery): Summary {
  const last = d.attempts[d.attempts.length - 1];
  const autoRetries = d.attempts.filter((a) => !a.manual && a.n > 1).length;
  const retriesLeft = RETRY_S.length - autoRetries;
  if (last.behaviour === 'ok') {
    return { status: 'Completed', nextAt: null, retriesLeft, note: 'Your endpoint replied with a 2xx. Nothing more to do.' };
  }
  if (last.behaviour === 'silent') {
    return {
      status: 'Timeout', nextAt: null, retriesLeft,
      note: 'No response within 30 seconds. Timeouts are not retried automatically — resend this event manually once your endpoint is healthy.',
    };
  }
  if (last.manual) {
    return { status: 'Failed', nextAt: null, retriesLeft, note: 'The manual resend got a non-2xx reply. Fix the handler, then resend again.' };
  }
  if (retriesLeft <= 0) {
    return { status: 'Failed', nextAt: null, retriesLeft: 0, note: 'All six retries used. Fix the handler, then resend manually.' };
  }
  return {
    status: 'Pending', nextAt: last.at + RETRY_S[autoRetries], retriesLeft,
    note: `Your endpoint replied ${last.code}. Xendit will retry automatically (${retriesLeft} left).`,
  };
}

export function fmtOffset(sec: number): string {
  if (sec < 60) return `+${Math.round(sec)} s`;
  if (sec < 3600) return `+${Math.round(sec / 60)} min`;
  if (sec < 86400) return `+${+(sec / 3600).toFixed(1)} h`;
  return `+${+(sec / 86400).toFixed(1)} d`;
}

export const fmtInterval = (s: number) => (s < 3600 ? `${s / 60} min` : `${s / 3600} h`);
