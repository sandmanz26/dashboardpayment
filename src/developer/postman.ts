export const BASE_URL = 'https://api.xendit.co';

export interface Endpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  headers?: Record<string, string>;
  body?: unknown;
  response: unknown;
}

export const endpoints: Endpoint[] = [
  {
    id: 'balance',
    name: 'Get balance',
    method: 'GET',
    path: '/balance?account_type=CASH',
    description: 'Retrieve the available CASH balance of your business.',
    response: { balance: 1000000000 },
  },
  {
    id: 'transactions',
    name: 'List transactions',
    method: 'GET',
    path: '/transactions?types=TOP_UP&limit=10',
    description: 'List balance transactions, newest first.',
    response: {
      has_more: false,
      data: [{
        id: 'txn_7d1c0f4a-2b8e-4f1a-9a55-3c1b7e9d6f20',
        type: 'TOP_UP',
        status: 'SUCCESS',
        currency: 'IDR',
        amount: 1000000000,
        net_amount: 1000000000,
        cashflow: 'MONEY_IN',
        created: '2026-09-30T04:17:05.000Z',
      }],
    },
  },
  {
    id: 'invoice',
    name: 'Create invoice',
    method: 'POST',
    path: '/v2/invoices',
    description: 'Create a payment invoice your customer can pay through any enabled channel.',
    body: {
      external_id: 'invoice-001',
      amount: 150000,
      currency: 'IDR',
      payer_email: 'customer@example.com',
      description: 'Test invoice',
    },
    response: {
      id: '66a1f0c2b7e4d8001c9e5a31',
      external_id: 'invoice-001',
      status: 'PENDING',
      amount: 150000,
      currency: 'IDR',
      invoice_url: 'https://checkout-staging.xendit.co/web/66a1f0c2b7e4d8001c9e5a31',
      expiry_date: '2026-10-01T04:17:05.000Z',
    },
  },
  {
    id: 'payout',
    name: 'Create payout',
    method: 'POST',
    path: '/v2/payouts',
    description: 'Send money to a bank account or e-wallet. An Idempotency-key header is required.',
    headers: { 'Idempotency-key': 'payout-0001' },
    body: {
      reference_id: 'payout-0001',
      channel_code: 'ID_BCA',
      channel_properties: { account_holder_name: 'John Doe', account_number: '000000' },
      amount: 90000,
      currency: 'IDR',
      description: 'Test payout',
    },
    response: {
      id: 'disb-5e8a2c71-04d3-4b9a-8f6e-1a2b3c4d5e6f',
      reference_id: 'payout-0001',
      status: 'ACCEPTED',
      amount: 90000,
      currency: 'IDR',
    },
  },
];

export const pretty = (v: unknown) => JSON.stringify(v, null, 2);

/** cURL command. Xendit authenticates with HTTP Basic: secret key as username, empty password. */
export function curl(e: Endpoint, key = 'YOUR_SECRET_KEY'): string {
  const headers = Object.entries({ ...(e.body ? { 'Content-Type': 'application/json' } : {}), ...e.headers });
  const parts = [`curl ${e.method === 'POST' ? '-X POST ' : ''}'${BASE_URL}${e.path}'`, `-u ${key}:`];
  headers.forEach(([k, v]) => parts.push(`-H '${k}: ${v}'`));
  if (e.body) parts.push(`-d '${JSON.stringify(e.body)}'`);
  return parts.map((p, i) => (i === 0 ? p : `  ${p}`)).join(' \\\n');
}

const splitUrl = (path: string) => {
  const [p, q] = path.split('?');
  return {
    raw: `{{base_url}}${path}`,
    host: ['{{base_url}}'],
    path: p.split('/').filter(Boolean),
    query: q ? q.split('&').map((kv) => { const [key, value] = kv.split('='); return { key, value }; }) : undefined,
  };
};

/** Postman Collection v2.1 */
export function buildCollection() {
  return {
    info: {
      name: 'Xendit API – UIByte (test mode)',
      description: 'Sample requests for the Xendit API. Set the secret_key variable in the environment before sending.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'basic',
      basic: [{ key: 'username', value: '{{secret_key}}', type: 'string' }, { key: 'password', value: '', type: 'string' }],
    },
    item: endpoints.map((e) => ({
      name: e.name,
      request: {
        method: e.method,
        description: e.description,
        header: [
          ...(e.body ? [{ key: 'Content-Type', value: 'application/json' }] : []),
          ...Object.entries(e.headers ?? {}).map(([key, value]) => ({ key, value })),
        ],
        url: splitUrl(e.path),
        ...(e.body ? { body: { mode: 'raw', raw: pretty(e.body), options: { raw: { language: 'json' } } } } : {}),
      },
      response: [],
    })),
  };
}

export function buildEnvironment() {
  return {
    name: 'Xendit – UIByte (test)',
    values: [
      { key: 'base_url', value: BASE_URL, type: 'default', enabled: true },
      { key: 'secret_key', value: '', type: 'secret', enabled: true },
    ],
    _postman_variable_scope: 'environment',
  };
}

export function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([pretty(data)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
