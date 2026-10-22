#!/usr/bin/env node
/* One-off: the log sheet follows the Plans diet card: header "1 of 2 eaten", an eaten row locks its amount and says "Eaten", an open row has the stepper and macros. */
const fs = require('fs');
const p = 'src/features/today/LogMealsSheet.tsx';
let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 90)); s = s.replace(a, b); };

rep("  const allOn = x.eaten.length === m.items.length;", "  const total = m.items.length + x.extra.length, eatenN = x.eaten.length + x.extra.length;\n  const allOn = eatenN === total;");
rep("{`${m.items.length + x.extra.length} items · ~${kcal} kcal · P ${prot} g`}", "{`${allOn ? 'All eaten' : eatenN ? `${eatenN} of ${total} eaten` : `${total} items`} · ~${kcal} kcal · P ${prot} g`}");
// an eaten row: the amount is locked text and the line under it says "Eaten"
rep("                {qty ? (\n", "                {qty && on ? (\n                  <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.muted }}>{fmtQty(cur, qty.unit)}</Txt>\n                ) : qty ? (\n");
rep("<Txt v=\"caption\" numberOfLines={1}>{`~${n.k} kcal · P ${n.p} · C ${Math.round((n.k * 0.5) / 4)} · F ${Math.round((n.k * 0.3) / 9)} g`}</Txt>", "<Txt v=\"caption\" numberOfLines={1}>{on ? `Eaten · ~${n.k} kcal` : `~${n.k} kcal · P ${n.p} · C ${Math.round((n.k * 0.5) / 4)} · F ${Math.round((n.k * 0.3) / 9)} g`}</Txt>");
fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('sheet-like-plans pass done');
