import { sharePdf } from '@/features/reports/pdf';
import { invoiceHtml, statementHtml } from '@/features/reports/templates';
import { rupees } from '@/features/reports/payments';
import type { Payment } from '@/features/reports/payments';

/** Makes the invoice for one payment as a PDF and opens the share sheet. Returns false when the phone cannot share files. */
export function shareInvoice(p: Payment, member: string) {
  const html = invoiceHtml({ no: p.no, date: p.date, gym: 'Wulf Fitness', member, item: p.item, amount: rupees(p.amount), method: p.method });
  return sharePdf(html, 'Invoice ' + p.no);
}

/** Makes one statement with all the given payments and opens the share sheet. */
export function shareStatement(payments: Payment[], member: string, title: string) {
  const total = payments.reduce((a, p) => a + p.amount, 0);
  const html = statementHtml({
    gym: 'Wulf Fitness', member, title, made: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    rows: payments.map((p) => ({ no: p.no, date: p.date, item: p.item, amount: rupees(p.amount), method: p.method })), total: rupees(total),
  });
  return sharePdf(html, 'Payments ' + title);
}
