/** Permission matrix for the Generate API key dialog. Dummy data, shaped like the real console. */
export interface Feature { name: string; desc?: string; levels: ('none' | 'read' | 'write')[] }

export const FEATURES: Feature[] = [
  { name: 'Conversions', desc: 'Quotes', levels: ['none', 'read', 'write'] },
  { name: 'Money-in products', desc: 'Credit card, Virtual accounts, Retail Outlets (OTC), Invoices, Recurring payments, E-wallets, PayLater', levels: ['none', 'read', 'write'] },
  { name: 'Money-out products', desc: 'Disbursements, Batch disbursements, Payout Link', levels: ['none', 'read', 'write'] },
  { name: 'Balance', levels: ['none', 'read'] },
  { name: 'Report', levels: ['none', 'read', 'write'] },
  { name: 'Transaction', levels: ['none', 'read'] },
  { name: 'Customer', levels: ['none', 'read', 'write'] },
  { name: 'Refund', levels: ['none', 'read', 'write'] },
  { name: 'Payment Method', desc: 'Cards, e-wallets and account linking', levels: ['none', 'read', 'write'] },
  { name: 'xenPlatform', desc: 'Sub-accounts, split rules and transfers', levels: ['none', 'read', 'write'] },
  { name: 'Webhook', levels: ['none', 'read', 'write'] },
];

export const NAME_LIMIT = 15;
