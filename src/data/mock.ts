export interface Transaction {
  id: string;
  createdAt: string; // ISO
  status: 'Successful' | 'Failed';
  amount: number;
  currency: string;
  type: string;
  category: 'Payment' | 'Payout' | 'Refund' | 'Others';
  channel: string;
  reference: string;
}

export const business = { name: 'UIByte', mode: 'Test Mode', user: 'Daniel Roy' };

export const balances = [
  { code: 'IDR', name: 'Indonesian Rupiah', isDefault: true, available: 1_000_000_000 },
];

export const transactions: Transaction[] = [
  {
    id: 'txn-1',
    createdAt: '2026-09-30T11:17:00+07:00',
    status: 'Successful',
    amount: 1_000_000_000,
    currency: 'IDR',
    type: 'Top Up',
    category: 'Others',
    channel: '',
    reference: 'topupactivity-b757c6f9-1da3-4c1e-9d0b-6a52f0c8e7a1',
  },
];

export const totalBalance = balances.reduce((s, b) => s + b.available, 0);

/** Weekly closing balance for the "Last 3 months" overview chart. */
export const chartLabels = [
  '6 Jul', '13 Jul', '20 Jul', '27 Jul', '3 Aug', '10 Aug',
  '17 Aug', '24 Aug', '31 Aug', '7 Sep', '14 Sep', '21 Sep', '28 Sep',
];
export const chartRanges = [
  '6 - 12 Jul', '13 - 19 Jul', '20 - 26 Jul', '27 Jul - 2 Aug', '3 - 9 Aug', '10 - 16 Aug',
  '17 - 23 Aug', '24 - 30 Aug', '31 Aug - 6 Sep', '7 - 13 Sep', '14 - 20 Sep', '21 - 27 Sep', '28 Sep - 4 Oct',
];
export const chartValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1_000_000_000];

export const fmt = (n: number, decimals = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
