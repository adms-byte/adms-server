export interface ReceiptData {
  orgName?: string;
  receiptNo?: string | number;
  date?: string;
  name?: string;
  amount?: string | number;
}

export function buildReceipt(r: ReceiptData): Buffer {
  const ESC = 0x1b;
  const GS = 0x1d;
  const parts: Buffer[] = [];
  const raw = (...bytes: number[]) => parts.push(Buffer.from(bytes));
  const line = (s = '') => parts.push(Buffer.from(String(s) + '\n', 'latin1'));

  raw(ESC, 0x40);                     // initialize
  raw(ESC, 0x61, 1);                  // center
  raw(ESC, 0x45, 1);                  // bold on
  line(r.orgName || 'DONATION RECEIPT');
  raw(ESC, 0x45, 0);                  // bold off
  line('--------------------------------');
  raw(ESC, 0x61, 0);                  // left
  line(`Receipt #: ${r.receiptNo ?? ''}`);
  line(`Date:      ${r.date ?? new Date().toLocaleDateString('en-IN')}`);
  line(`Donor:     ${r.name ?? ''}`);
  line(`Amount:    ${r.amount ?? ''}`);
  line('--------------------------------');
  line('Thank you for your support!');
  line();
  line();
  raw(GS, 0x56, 66, 0);               // partial cut

  return Buffer.concat(parts);
}