import { sharePdf } from '@/features/reports/pdf';
import { invoiceHtml } from '@/features/reports/templates';
import { rupees } from '@/features/reports/payments';
import type { Payment } from '@/features/reports/payments';

/** Makes the invoice for one payment as a PDF and opens the share sheet. Returns false when the phone cannot share files. */
export function shareInvoice(p: Payment, member: string) {
  const html = invoiceHtml({ no: p.no, date: p.date, gym: 'Wulf Fitness', member, item: p.item, amount: rupees(p.amount), method: p.method });
  return sharePdf(html, 'Invoice ' + p.no);
}
