export interface DevEvent { id: string; time: string; name: string; from: string; status: 'Succeeded' | 'Failed' }

const names = [
  'payment.succeeded', 'payment.pending', 'topup.succeeded', 'payout.succeeded', 'payout.processing',
  'balance.adjustment', 'balance.adjustment', 'refund.succeeded', 'invoice.paid', 'payment.failed',
];
const times = [
  '30 Sept 2026 at 11.17.05', '30 Sept 2026 at 11.17.05', '30 Sept 2026 at 11.17.03', '30 Sept 2026 at 11.16.48', '30 Sept 2026 at 11.16.48',
  '30 Sept 2026 at 11.15.02', '30 Sept 2026 at 11.14.31', '30 Sept 2026 at 11.12.10', '30 Sept 2026 at 11.12.02', '30 Sept 2026 at 11.11.40',
];
const ids = [
  '7f50a000-d7e6-4cd7-b0c6-90d1', '1a6194c7-f402-4bcf-8038-7691b', 'a22621e2-b910-4dcc-b4d5-71eb', 'cc2da66b-b907-4b1c-aabb-2221',
  'a18bbae6-4e8f-43fa-9a6d-92bc', 'c32c7443-b735-3123-b09b-845e', 'fce34504-e74e-37f0-bb4d-be4a', 'a9ddc08e-527a-48de-81ed-f36e',
  'cc842ff8-d2d5a-469c-a14d-70ec', '3be91d20-1c77-4f0a-92aa-6d13',
];

export const events: DevEvent[] = names.map((name, i) => ({
  id: ids[i], time: times[i], name, from: 'UIByte', status: name === 'payment.failed' ? 'Failed' : 'Succeeded',
}));
