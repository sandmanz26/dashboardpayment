/**
 * Webhook catalogue. All dummy data — names follow Xendit's public products, the version history
 * and sunset dates are invented for this demo.
 */
export type Category = 'Money in' | 'Money out' | 'Platform' | 'Account';
export type VersionStatus = 'current' | 'supported' | 'deprecated';

export interface ApiVersion {
  version: string;            // 'v3'
  status: VersionStatus;
  path: string;               // '/v3/payment_requests'
  released: string;
  sunset?: string;            // only for deprecated
  changes: string[];          // what changed against the previous version
}

export interface WebhookProduct {
  title: string;
  category: Category;
  items: string[];
  versions?: ApiVersion[];
  disabled?: string[];        // events that cannot be configured
  checks?: { label: string; checked: boolean }[];
}

/** Shared history for the payment-request family, which is the one with three live versions. */
const paymentRequestVersions: ApiVersion[] = [
  {
    version: 'v3', status: 'current', path: '/v3/payment_requests', released: '12 May 2026',
    changes: [
      'One endpoint for cards, e-wallets, QRIS and virtual accounts — the per-channel endpoints are gone.',
      '`amount` is now `request_amount`.',
      'The response returns `actions[]` instead of a single `action` object.',
      'New events: Captured Succeeded and Captured Failed, for separate authorise and capture.',
    ],
  },
  {
    version: 'v2', status: 'supported', path: '/v2/payment_requests', released: '3 Feb 2025',
    changes: [
      'Added Payment Verified for 3DS flows.',
      '`channel_properties` replaced the flat per-channel fields.',
    ],
  },
  {
    version: 'v1', status: 'deprecated', path: '/v1/payment_requests', released: '20 Aug 2023', sunset: '1 Mar 2027',
    changes: [
      'Original release. One endpoint per channel.',
      'No idempotency key support — replays create duplicate payments.',
    ],
  },
];

export const webhookProducts: WebhookProduct[] = [
  // ---------- Money in ----------
  { title: 'Invoices', category: 'Money in', items: ['Invoices paid'],
    checks: [
      { label: 'Also notify my application when an invoice has expired', checked: false },
      { label: 'Also notify my application when a payment has been received after expiry', checked: true },
    ] },
  { title: 'Fixed Virtual Accounts', category: 'Money in', items: ['FVA paid', 'FVA created'] },
  { title: 'Payment Requests', category: 'Money in', versions: paymentRequestVersions,
    items: ['Payment Succeeded', 'Payment Awaiting Capture', 'Payment Pending', 'Payment Failed', 'Captured Succeeded', 'Captured Failed'] },
  { title: 'Payment Methods', category: 'Money in',
    versions: [
      { version: 'v3', status: 'current', path: '/v3/payment_methods', released: '12 May 2026',
        changes: ['Payment methods are reusable across payment requests.', 'Status moved from `active` boolean to a `status` enum.'] },
      { version: 'v2', status: 'supported', path: '/v2/payment_methods', released: '3 Feb 2025',
        changes: ['Added tokenised cards.'] },
    ],
    items: ['Payment Method'] },
  { title: 'Payment Tokens', category: 'Money in',
    versions: [{ version: 'v3', status: 'current', path: '/v3/payment_tokens', released: '12 May 2026',
      changes: ['Tokens now carry an expiry and can be revoked.'] }],
    items: ['Payment Token Status'] },
  { title: 'Cards', category: 'Money in', items: ['Cards authorization', 'Cards chargeback'] },
  { title: 'E-Wallets', category: 'Money in', items: ['eWallet Payment Status', 'eWallet Reconciliation Update'] },
  { title: 'QR Codes', category: 'Money in', items: ['QR code paid & refunded', 'QR Reconciliation'] },
  { title: 'Retail Outlets (OTC)', category: 'Money in', items: ['Retail outlets (OTC) paid'] },
  { title: 'Direct Debit', category: 'Money in', items: ['Account linked', 'Payment completed', 'Expiring/Expired payment method', 'Refund finalized'] },
  { title: 'Paylater', category: 'Money in', items: ['Paylater Payment Status'] },
  { title: 'Payment Link', category: 'Money in', items: ['Payment Links'] },
  { title: 'Payment Session', category: 'Money in', items: ['Payment Session Completed', 'Payment Session Expired'] },
  { title: 'Recurring', category: 'Money in', items: ['Recurring'] },
  { title: 'Bill Payments', category: 'Money in', items: ['Bill Payment'] },

  // ---------- Money out ----------
  { title: 'Payouts', category: 'Money out',
    versions: [
      { version: 'v2', status: 'current', path: '/v2/payouts', released: '8 Jan 2026',
        changes: ['Single endpoint for all channels.', '`reference_id` replaced `external_id`.', 'Webhook carries `failure_code` on rejection.'] },
      { version: 'v1', status: 'deprecated', path: '/disbursements', released: '14 Jun 2022', sunset: '1 Jun 2027',
        changes: ['Original disbursement API.', 'No batch support — one request per payout.'] },
    ],
    items: ['Payouts v2'] },
  { title: 'Disbursement', category: 'Money out', items: ['Disbursement sent', 'Batch disbursement sent'] },
  { title: 'Refunds', category: 'Money out',
    versions: [
      { version: 'v3', status: 'current', path: '/refunds', released: '1 Aug 2026',
        changes: ['Refunds are a top-level resource.', 'Omitting `amount` means a full refund.'] },
      { version: 'v2', status: 'deprecated', path: '/payment_requests/{id}/refunds', released: '3 Feb 2025', sunset: '1 Feb 2027',
        changes: ['Refunds were nested under a payment request.', '`amount` was required.'] },
    ],
    items: ['Refund request succeeded', 'Refund request failed'] },
  { title: 'Remittance Payout', category: 'Money out',
    items: ['Remittance Payout succeeded', 'Remittance Payout failed', 'Remittance Payout refunded',
      'Remittance Payout pending compliance assessment', 'Remittance Payout compliance rejected'] },

  // ---------- Platform / Account ----------
  { title: 'Notifications', category: 'Account',
    items: ['Account Created', 'Account Updated', 'Account Suspension', 'Account Verification Status', 'Split Payment Status'],
    disabled: ['Account Created', 'Account Updated'] },
  { title: 'Report', category: 'Platform', items: ['Balance and Transactions report'] },
];

export const categories: Category[] = ['Money in', 'Money out', 'Platform', 'Account'];

/** Kept for the legacy settings page, which still renders the flat list. */
export const webhookGroups = webhookProducts;
