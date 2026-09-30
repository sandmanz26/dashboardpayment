export interface WebhookGroup {
  title: string;
  disabled?: boolean;
  items: string[];
  checks?: { label: string; checked: boolean }[];
}

export const webhookGroups: WebhookGroup[] = [
  { title: 'Fixed Virtual Accounts', items: ['FVA paid', 'FVA created'] },
  { title: 'Disbursement', items: ['Disbursement sent', 'Batch disbursement sent', 'Payouts v2'] },
  { title: 'Payment Link', items: ['Payment Links'] },
  { title: 'Retail Outlets (OTC)', items: ['Retail outlets (OTC) paid'] },
  { title: 'Cards', items: ['Cards authorization', 'Cards chargeback'] },
  { title: 'Direct Debit', items: ['Account linked', 'Payment completed', 'Expiring/Expired payment method', 'Refund finalized'] },
  {
    title: 'Invoices',
    items: ['Invoices paid'],
    checks: [
      { label: 'Also notify my application when an invoice has expired', checked: false },
      { label: 'Also notify my application when a payment has been received after expiry', checked: true },
    ],
  },
  { title: 'Notifications', items: ['Account Created', 'Account Updated', 'Account Suspension', 'Account Verification Status', 'Split Payment Status'] },
  { title: 'Report', items: ['Balance and Transactions report'] },
  {
    title: 'Payment Requests v3 (/v3/payment_requests)',
    items: ['Payment Succeeded', 'Payment Awaiting Capture', 'Payment Pending', 'Payment Failed', 'Captured Succeeded', 'Captured Failed'],
  },
  { title: 'Refunds (v3)', items: ['Refund request succeeded', 'Refund request failed'] },
  { title: 'Payment Methods v3 (/v3/payment_methods)', items: ['Payment Method'] },
  { title: 'Payment Requests v2 (/v2/payment_requests)', items: ['Payment Status', 'Payment Request Status', 'Payment Verified'] },
  { title: 'Payment Tokens v3 (/v3/payment_tokens)', items: ['Payment Token Status'] },
  { title: 'Recurring', items: ['Recurring'] },
  { title: 'E-Wallets', items: ['eWallet Payment Status', 'eWallet Reconciliation Update'] },
  { title: 'Paylater', items: ['Paylater Payment Status'] },
  { title: 'QR Codes', items: ['QR code paid & refunded', 'QR Reconciliation'] },
  {
    title: 'Remittance Payout',
    items: [
      'Remittance Payout succeeded', 'Remittance Payout failed', 'Remittance Payout refunded',
      'Remittance Payout pending compliance assessment', 'Remittance Payout compliance rejected',
    ],
  },
  { title: 'Payment Session', items: ['Payment Session Completed', 'Payment Session Expired'] },
  { title: 'Bill Payments', items: ['Bill Payment'] },
  { title: 'Payouts v2', items: ['Payouts v2'] },
];
