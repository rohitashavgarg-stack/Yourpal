import React from 'react';
import data from './coverage.json';
import { fontSizes } from '@/design-system/tokens';

// The Storybook "Coverage" page: what is in the library and what is still hand-built. The data comes from
// scripts/audit/coverage-storybook.js (run after scripts/audit/coverage.js --json). Plain HTML: this page only runs in Storybook.
type Lib = { name: string; group: string; file: string; doc: boolean; uses: number; files: number };
type Hand = { where: string; kind: string; look: string; jsx: string };
type Exc = { where: string; what: string; why: string };

const cell: React.CSSProperties = { textAlign: 'left', verticalAlign: 'top', padding: '6px 10px', borderBottom: '1px solid rgba(127,127,127,0.25)', fontSize: fontSizes.sm, lineHeight: '18px' };
const head: React.CSSProperties = { ...cell, fontWeight: 600 };
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: fontSizes.xs };

function Table({ cols, rows }: { cols: string[]; rows: React.ReactNode[][] }) {
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', margin: '8px 0 24px' }}>
      <thead><tr>{cols.map((c) => <th key={c} style={head}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((x, j) => <td key={j} style={cell}>{x}</td>)}</tr>)}</tbody>
    </table>
  );
}

export function CoveragePage() {
  const lib = data.library as Lib[];
  const hand = data.handBuilt as Hand[];
  const exc = data.exceptions as Exc[];
  const kinds = hand.reduce<Record<string, number>>((a, h) => ({ ...a, [h.kind]: (a[h.kind] ?? 0) + 1 }), {});
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 1100 }}>
      <p>Generated {data.generated}. {lib.length} components in the library, {hand.length} elements still hand-built, {exc.length} hand-built on purpose.</p>
      <h2>In the library</h2>
      <Table cols={['Component', 'Group', 'Uses in the app', 'Files', 'Doc', 'Source']}
        rows={lib.map((c) => [<strong key="n">{c.name}</strong>, c.group, c.uses, c.files, c.doc ? 'yes' : 'no', <span key="f" style={mono}>{c.file}</span>])} />
      <h2>Still hand-built</h2>
      <p>{Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(', ')}. Each is a candidate for a library component. This page counts every place in the code once (docs/coverage.md counts per screen, so its total is lower; see it for the screen each one is on).</p>
      <Table cols={['Where', 'Kind', 'Look', 'Start of the JSX']}
        rows={hand.map((h) => [<span key="w" style={mono}>{h.where}</span>, h.kind, h.look, <span key="j" style={mono}>{h.jsx}</span>])} />
      <h2>Hand-built on purpose</h2>
      <Table cols={['Where', 'What it is', 'Why it stays']} rows={exc.map((e) => [<span key="w" style={mono}>{e.where}</span>, e.what, e.why])} />
    </div>
  );
}
