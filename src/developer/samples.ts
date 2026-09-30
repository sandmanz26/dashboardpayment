/**
 * Sample webhook payloads. All values are fictional.
 * Shapes are illustrative, written from memory of the public docs — verify against docs.xendit.co before relying on them.
 */
export interface Sample { fires: string; payload: unknown; illustrative?: boolean }

const BIZ = '65f0c1e2a4b7d900123abcde';
const NOW = '2026-09-30T04:17:05.000Z';

export function invoicePaidPayload(o: { id: string; external_id: string; amount: number; payer_email?: string; description?: string; created?: string }) {
  return {
    id: o.id,
    external_id: o.external_id,
    user_id: BIZ,
    status: 'PAID',
    merchant_name: 'UIByte',
    amount: o.amount,
    paid_amount: o.amount,
    payment_method: 'BANK_TRANSFER',
    payment_channel: 'BCA',
    payment_destination: '0000000000',
    bank_code: 'BCA',
    paid_at: '2026-09-30T04:17:50.000Z',
    payer_email: o.payer_email ?? 'customer@example.com',
    description: o.description ?? '',
    currency: 'IDR',
    created: o.created ?? NOW,
    updated: '2026-09-30T04:17:50.000Z',
  };
}

const curated: Record<string, Sample> = {
  'Invoices paid': {
    fires: 'When a customer pays an invoice in full.',
    payload: invoicePaidPayload({ id: '66a1f0c2b7e4d8001c9e5a31', external_id: 'invoice-001', amount: 150000 }),
  },
  'FVA paid': {
    fires: 'When money arrives in a fixed virtual account.',
    payload: {
      id: '66a1f0c2b7e4d8001c9e5b02', payment_id: 'pay-5e8a2c71', external_id: 'fva-001', account_number: '0000000000',
      bank_code: 'BCA', amount: 150000, transaction_timestamp: NOW, merchant_code: '00000', sender_name: 'FAKE SENDER',
    },
  },
  'Disbursement sent': {
    fires: 'When a disbursement reaches a final state.',
    payload: {
      id: '66a1f0c2b7e4d8001c9e5c10', external_id: 'disb-001', amount: 90000, bank_code: 'BCA', account_holder_name: 'John Doe',
      disbursement_description: 'Test payout', status: 'COMPLETED', is_instant: false, created: NOW, updated: NOW, user_id: BIZ,
    },
  },
  'Payouts v2': {
    fires: 'When a payout changes status (succeeded, failed, reversed).',
    payload: {
      event: 'payout.succeeded', business_id: BIZ, created: NOW,
      data: { id: 'disb-5e8a2c71-04d3-4b9a-8f6e-1a2b3c4d5e6f', reference_id: 'payout-0001', channel_code: 'ID_BCA', amount: 90000, currency: 'IDR', status: 'SUCCEEDED' },
    },
  },
  'Payment Succeeded': {
    fires: 'When a payment request is paid successfully.',
    payload: {
      event: 'payment.succeeded', business_id: BIZ, created: NOW,
      data: { payment_id: 'py-0f3a9c1e', payment_request_id: 'pr-7d1c0f4a', reference_id: 'order-001', status: 'SUCCEEDED', currency: 'IDR', request_amount: 150000 },
    },
  },
  'Payment Failed': {
    fires: 'When a payment attempt fails or is declined.',
    payload: {
      event: 'payment.failed', business_id: BIZ, created: NOW,
      data: { payment_id: 'py-0f3a9c1f', reference_id: 'order-002', status: 'FAILED', failure_code: 'INSUFFICIENT_BALANCE', currency: 'IDR', request_amount: 150000 },
    },
  },
  'Refund request succeeded': {
    fires: 'When a refund is completed.',
    payload: { event: 'refund.succeeded', business_id: BIZ, created: NOW, data: { id: 'rfd-2b9e1a77', payment_request_id: 'pr-7d1c0f4a', amount: 150000, currency: 'IDR', status: 'SUCCEEDED' } },
  },
  'eWallet Payment Status': {
    fires: 'When an e-wallet charge changes status.',
    payload: { event: 'ewallet.capture', business_id: BIZ, created: NOW, data: { id: 'ewc_6c1d4f0a', reference_id: 'order-003', channel_code: 'ID_OVO', charge_amount: 150000, currency: 'IDR', status: 'SUCCEEDED' } },
  },
  'QR code paid & refunded': {
    fires: 'When a QR payment is paid or refunded.',
    payload: { event: 'qr.payment', business_id: BIZ, created: NOW, data: { id: 'qrpy_8e2b7c1d', qr_id: 'qr_1a2b3c4d', reference_id: 'qr-001', amount: 150000, currency: 'IDR', status: 'COMPLETED' } },
  },
};

/** Sample for any event. Events without a curated example get a generic, clearly-labelled shape. */
export function sampleFor(name: string): Sample {
  if (curated[name]) return curated[name];
  return {
    illustrative: true,
    fires: `When “${name}” changes state.`,
    payload: {
      event: name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, ''),
      business_id: BIZ, created: NOW,
      data: { id: 'obj-00000000', reference_id: 'ref-001', status: 'SUCCEEDED', currency: 'IDR', amount: 150000 },
    },
  };
}
