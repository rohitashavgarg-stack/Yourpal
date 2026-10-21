// The "Repeated hand-built elements" section of docs/coverage.md.
// A pattern is the same kind, size, corner radius and fill (the `sig` of a hit). It is listed when it appears on 3 or more rows
// (screens, sheets, steps, overlays) of the coverage tables.
module.exports = function repeatedSection(rows, total) {
  const pat = new Map();
  for (const r of rows) {
    for (const h of r.hand) {
      if (!h.sig) continue;
      const e = pat.get(h.sig) || { kind: h.kind, hits: [], rows: new Map() };
      e.hits.push(h);
      const cur = e.rows.get(r.id) || { screen: r.screen, n: 0 };
      cur.n++; e.rows.set(r.id, cur); pat.set(h.sig, e);
    }
  }
  const rep = [...pat.entries()].filter(([, e]) => e.rows.size >= 3).sort((a, b) => b[1].rows.size - a[1].rows.size || b[1].hits.length - a[1].hits.length);
  let md = '## Repeated hand-built elements\n\n';
  md += 'Every hand-built pattern (same kind, size, corner radius and fill) that appears on 3 or more screens or surfaces. "Count" is the number of hand-built elements; "Screens" is the number of rows in the tables above that have it. Web demo-panel code is left out.\n\n';
  md += '| Pattern | Kind | Count | Screens | Where |\n|---|---|---|---|---|\n';
  for (const [sig, e] of rep) md += '| ' + sig + ' | ' + e.kind + ' | ' + e.hits.length + ' | ' + e.rows.size + ' | ' + [...e.rows.values()].map((x) => x.screen + (x.n > 1 ? ' x' + x.n : '')).join('; ') + ' |\n';
  const byKind = {};
  for (const e of pat.values()) {
    const k = byKind[e.kind] || (byKind[e.kind] = { hits: 0, rows: new Set(), patterns: 0 });
    k.hits += e.hits.length; k.patterns++; e.rows.forEach((v, id) => k.rows.add(id));
  }
  md += '\nBy kind, all sizes together:\n\n| Kind | Elements | Distinct patterns | Screens |\n|---|---|---|---|\n';
  for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1].hits - a[1].hits)) md += '| ' + k + ' | ' + v.hits + ' | ' + v.patterns + ' | ' + v.rows.size + ' |\n';
  md += '\nPatterns on 3 or more screens: **' + rep.length + '**, covering ' + rep.reduce((a, [, e]) => a + e.hits.length, 0) + ' of the ' + total + ' hand-built elements.\n\n';
  return md;
};
