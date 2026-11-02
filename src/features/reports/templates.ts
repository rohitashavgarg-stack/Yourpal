// The HTML behind each PDF. Plain HTML and CSS: the phone's print engine turns it into a PDF.

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const BRAND = '#2F6BEA';
const css = `
  @page { margin: 28px; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #12151C; font-size: 14px; line-height: 1.5; margin: 0; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${BRAND}; padding-bottom: 14px; }
  .brand { font-size: 22px; font-weight: 700; color: ${BRAND}; }
  .muted { color: #5C6370; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  h2 { font-size: 13px; letter-spacing: 0.8px; text-transform: uppercase; color: #5C6370; margin: 26px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 10px 0; border-bottom: 1px solid #E4E8EE; text-align: left; vertical-align: top; }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.6px; color: #5C6370; }
  .r { text-align: right; }
  .total td { border-bottom: none; font-size: 16px; font-weight: 700; padding-top: 14px; }
  .tiles { display: flex; gap: 10px; }
  .tile { flex: 1; background: #F5F7FA; border-radius: 10px; padding: 12px 14px; }
  .tile b { display: block; font-size: 20px; }
  .foot { margin-top: 40px; font-size: 12px; color: #5C6370; border-top: 1px solid #E4E8EE; padding-top: 10px; }
`;

const page = (body: string) => `<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${css}</style></head><body>${body}</body></html>`;

export type InvoiceData = {
  no: string; date: string; gym: string; member: string; memberId: string;
  item: string; amount: string; method: string;
};

export function invoiceHtml(i: InvoiceData) {
  return page(`
    <div class="top">
      <div class="brand">${esc(i.gym)}</div>
      <div style="text-align:right"><h1>Invoice</h1><div class="muted">${esc(i.no)}</div><div class="muted">${esc(i.date)}</div></div>
    </div>
    <h2>Billed to</h2>
    <div><b>${esc(i.member)}</b></div>
    <div class="muted">Member ID ${esc(i.memberId)}</div>
    <h2>Details</h2>
    <table>
      <tr><th>Item</th><th class="r">Amount</th></tr>
      <tr><td>${esc(i.item)}</td><td class="r">${esc(i.amount)}</td></tr>
      <tr class="total"><td>Total paid</td><td class="r">${esc(i.amount)}</td></tr>
    </table>
    <div class="muted" style="margin-top:6px">Paid via ${esc(i.method)}</div>
    <div class="foot">This is a computer generated invoice and needs no signature.</div>
  `);
}

export type ReportData = {
  member: string; gym: string; period: string; made: string;
  goal: string; goalBy: string;
  weight: { start: string; now: string; change: string } | null;
  water: string | null;
  workouts: { weekDone: number; target: number; weeks: number; logged: number };
};

export function reportHtml(r: ReportData) {
  const row = (l: string, v: string) => `<tr><td class="muted">${esc(l)}</td><td class="r"><b>${esc(v)}</b></td></tr>`;
  return page(`
    <div class="top">
      <div><div class="brand">${esc(r.gym)}</div><div class="muted">Progress report</div></div>
      <div style="text-align:right"><h1>${esc(r.member)}</h1><div class="muted">${esc(r.period)}</div></div>
    </div>
    <h2>Your goal</h2>
    <table>${row('Goal', r.goal)}${row('Target date', r.goalBy)}</table>
    <h2>Attendance</h2>
    <div class="tiles">
      <div class="tile"><b>${r.workouts.weekDone} of ${r.workouts.target}</b><span class="muted">sessions this week</span></div>
      <div class="tile"><b>${r.workouts.weeks}</b><span class="muted">week streak</span></div>
      <div class="tile"><b>${r.workouts.logged}</b><span class="muted">workouts logged</span></div>
    </div>
    <h2>Measurements</h2>
    <table>
      ${r.weight ? row('Weight at the start', r.weight.start) + row('Weight now', r.weight.now) + row('Change', r.weight.change) : '<tr><td class="muted">No weight logged in this period.</td></tr>'}
      ${r.water ? row('Water, daily average', r.water) : ''}
    </table>
    <div class="foot">Made on ${esc(r.made)} from the data in your YourPal app.</div>
  `);
}

export type WorkoutPlanData = {
  member: string; gym: string; made: string;
  days: { day: string; name: string; time?: string; warm: string[]; ex: { n: string; line: string }[]; cool: string[] }[];
};

export function workoutPlanHtml(w: WorkoutPlanData) {
  const days = w.days.map((d) => `
    <h2>${esc(d.day)}</h2>
    <div><b>${esc(d.name)}</b>${d.time ? ` <span class="muted">at ${esc(d.time)}</span>` : ''}</div>
    ${d.ex.length ? `<table>${d.ex.map((e) => `<tr><td>${esc(e.n)}</td><td class="r">${esc(e.line)}</td></tr>`).join('')}</table>` : '<div class="muted">Rest day</div>'}
    ${d.warm.length ? `<div class="muted" style="margin-top:6px">Warm-up: ${esc(d.warm.join(', '))}</div>` : ''}
    ${d.cool.length ? `<div class="muted">Cool-down: ${esc(d.cool.join(', '))}</div>` : ''}
  `).join('');
  return page(`
    <div class="top">
      <div><div class="brand">${esc(w.gym)}</div><div class="muted">Workout plan</div></div>
      <div style="text-align:right"><h1>${esc(w.member)}</h1><div class="muted">From Coach Vikram</div></div>
    </div>
    ${days}
    <div class="foot">Made on ${esc(w.made)} from the plan in your YourPal app.</div>
  `);
}

export type DietPlanData = {
  member: string; gym: string; made: string; diet: string;
  meals: { n: string; time: string; items: { n: string; kcal: number; macros: string }[] }[];
  totalKcal: number;
};

export function dietPlanHtml(p: DietPlanData) {
  const meals = p.meals.map((m) => `
    <h2>${esc(m.n)} <span style="text-transform:none;letter-spacing:0">at ${esc(m.time)}</span></h2>
    <table>${m.items.map((i) => `<tr><td>${esc(i.n)}<div class="muted" style="font-size:12px">${esc(i.macros)}</div></td><td class="r">${i.kcal} kcal</td></tr>`).join('')}</table>
  `).join('');
  return page(`
    <div class="top">
      <div><div class="brand">${esc(p.gym)}</div><div class="muted">Diet plan</div></div>
      <div style="text-align:right"><h1>${esc(p.member)}</h1><div class="muted">${esc(p.diet)}</div></div>
    </div>
    ${meals}
    <h2>Total</h2>
    <table><tr class="total"><td>For the day</td><td class="r">${p.totalKcal} kcal</td></tr></table>
    <div class="foot">Made on ${esc(p.made)} from the plan in your YourPal app.</div>
  `);
}
