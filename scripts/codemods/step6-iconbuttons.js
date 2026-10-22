#!/usr/bin/env node
/*
 * Icon buttons: extends IconButton (size, radius, border, disabled) and replaces the 11 hand-built 44 px and 40 px icon buttons whose size,
 * radius and fill are exactly the IconButton look. Each replacement keeps every other style value (opacity, margin, position) in `style`.
 */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('missing in file: ' + a.slice(0, 90)); return s.replace(a, b); };
const IMP = "import { IconButton } from '@/design-system/primitives/Button';\n";
const addImport = (s) => (s.includes("IconButton") && /import \{[^}]*IconButton[^}]*\} from '@\/design-system\/primitives\/Button'/.test(s) ? s : s.replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, '$1' + IMP));

// ---- the primitive
edit('src/design-system/primitives/Button.tsx', (s) => {
  s = rep(s, "  /** Press scale. Default 0.97; the stepper buttons use 0.9. */\n  scaleTo?: number;\n", "  /** Press scale. Default 0.97; the stepper buttons use 0.9. */\n  scaleTo?: number;\n  /** Width and height in px. Default 44. */\n  size?: number;\n  /** Corner radius in px. Default `radii.lg`; use half the size for a circle. */\n  radius?: number;\n  /** An outline: line colour and width. */\n  borderColor?: string;\n  borderWidth?: number;\n  /** Not pressable. Dim it with `style` (opacity). */\n  disabled?: boolean;\n");
  s = rep(s, "/** A 44 px rounded square with one icon or sign in it: close, back, minus, plus. */\nexport function IconButton({ label, onPress, children, bg, style, glass, scaleTo }: IconButtonProps) {", "/** A rounded square (44 px by default) with one icon or sign in it: close, back, minus, plus, play. */\nexport function IconButton({ label, onPress, children, bg, style, glass, scaleTo, size = 44, radius = radii.lg, borderColor, borderWidth, disabled }: IconButtonProps) {");
  s = rep(s, "onPress={onPress} scaleTo={scaleTo}\n      style={[{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: glass ? 'transparent' : bg ?? c.surface2, alignItems: 'center', justifyContent: 'center' }, rim, style]}>", "onPress={onPress} scaleTo={scaleTo} disabled={disabled}\n      style={[{ width: size, height: size, borderRadius: radius, backgroundColor: glass ? 'transparent' : bg ?? c.surface2, alignItems: 'center', justifyContent: 'center', ...(borderWidth ? { borderWidth, borderColor } : null) }, rim, style]}>");
  return s;
});

// ---- the 11 elements
edit('src/app/workout.tsx', (s) => addImport(rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel="Exercise options: swap, ask coach, form tips, skip" onPress={() => openSheet(<WkMenuSheet api={api} />, { label: 'Workout options' })}
                    style={{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: cardChip, alignItems: 'center', justifyContent: 'center' }}>
                    <Ellipsis size={20} color={cardInk} />
                  </Pressy>`,
`<IconButton label="Exercise options: swap, ask coach, form tips, skip" onPress={() => openSheet(<WkMenuSheet api={api} />, { label: 'Workout options' })} bg={cardChip}>
                    <Ellipsis size={20} color={cardInk} />
                  </IconButton>`)));
edit('src/features/workout/SetRow.tsx', (s) => addImport(rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel={timing ? 'Stop timer and log' : \`Start \${p.draft.t} second timer\`} onPress={p.onTimer}
                      style={{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: timing ? c.warn : c.accent, alignItems: 'center', justifyContent: 'center' }}>
                      {timing ? <Square size={13} color={fixed.white} fill={fixed.white} /> : <Play size={15} color={fixed.white} fill={fixed.white} />}
                    </Pressy>`,
`<IconButton label={timing ? 'Stop timer and log' : \`Start \${p.draft.t} second timer\`} onPress={p.onTimer} bg={timing ? c.warn : c.accent}>
                      {timing ? <Square size={13} color={fixed.white} fill={fixed.white} /> : <Play size={15} color={fixed.white} fill={fixed.white} />}
                    </IconButton>`)));
edit('src/features/workout/NewWorkoutUI.tsx', (s) => {
  s = rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel="Exercise options: swap, ask coach, form tips, skip" onPress={onMenu} scaleTo={0.92}
            style={{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
            <Ellipsis size={20} color={c.ink} />
          </Pressy>`,
`<IconButton label="Exercise options: swap, ask coach, form tips, skip" onPress={onMenu} scaleTo={0.92} style={{ marginTop: 2 }}>
            <Ellipsis size={20} color={c.ink} />
          </IconButton>`);
  s = rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel="Full screen" onPress={goFull} scaleTo={0.92}
        style={{ position: 'absolute', right: 10, bottom: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: fixed.white, borderWidth: 1, borderColor: '#C9D1DD', alignItems: 'center', justifyContent: 'center' }}>
        <Maximize2 size={18} color={INK} />
      </Pressy>`,
`<IconButton label="Full screen" onPress={goFull} scaleTo={0.92} size={40} radius={20} bg={fixed.white} borderWidth={1} borderColor="#C9D1DD" style={{ position: 'absolute', right: 10, bottom: 10 }}>
        <Maximize2 size={18} color={INK} />
      </IconButton>`);
  return addImport(s);
});
edit('src/features/progress/TrendUI.tsx', (s) => {
  s = rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel="Earlier" disabled={!win.canPrev} onPress={() => go(-1)} style={{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: win.canPrev ? 1 : 0.35 }}>
            <ChevronLeft size={20} color={c.ink} />
          </Pressy>`,
`<IconButton label="Earlier" disabled={!win.canPrev} onPress={() => go(-1)} style={{ opacity: win.canPrev ? 1 : 0.35 }}>
            <ChevronLeft size={20} color={c.ink} />
          </IconButton>`);
  s = rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel="Later" disabled={!win.canNext} onPress={() => go(1)} style={{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: win.canNext ? 1 : 0.35 }}>
            <ChevronRight size={20} color={c.ink} />
          </Pressy>`,
`<IconButton label="Later" disabled={!win.canNext} onPress={() => go(1)} style={{ opacity: win.canNext ? 1 : 0.35 }}>
            <ChevronRight size={20} color={c.ink} />
          </IconButton>`);
  s = rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel="Previous month" disabled={!canBack} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: canBack ? 1 : 0.35 }}><ChevronLeft size={20} color={c.ink} /></Pressy>`,
`<IconButton label="Previous month" disabled={!canBack} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={{ opacity: canBack ? 1 : 0.35 }}><ChevronLeft size={20} color={c.ink} /></IconButton>`);
  s = rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel="Next month" disabled={!canFwd} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: canFwd ? 1 : 0.35 }}><ChevronRight size={20} color={c.ink} /></Pressy>`,
`<IconButton label="Next month" disabled={!canFwd} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={{ opacity: canFwd ? 1 : 0.35 }}><ChevronRight size={20} color={c.ink} /></IconButton>`);
  s = rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel={d.toDateString()} disabled={future} onPress={() => { progressStore.set({ anchor: sod(d).getTime() }); haptic.tick(); closeSheet(); }} scaleTo={0.9}
                    style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: inWin ? c.accentSoft : 'transparent', borderWidth: isToday ? 1.5 : 0, borderColor: c.accent, opacity: future ? 0.3 : 1 }}>`,
`<IconButton label={d.toDateString()} disabled={future} onPress={() => { progressStore.set({ anchor: sod(d).getTime() }); haptic.tick(); closeSheet(); }} scaleTo={0.9} size={40} radius={20} bg={inWin ? c.accentSoft : 'transparent'} borderWidth={isToday ? 1.5 : 0} borderColor={c.accent} style={{ opacity: future ? 0.3 : 1 }}>`);
  s = rep(s, "backgroundColor: c.accent, opacity: 0.6 }} />}\n                  </Pressy>", "backgroundColor: c.accent, opacity: 0.6 }} />}\n                  </IconButton>");
  return addImport(s);
});
edit('src/features/workout/ClipStage.tsx', (s) => addImport(rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel={IS_WEB && wide ? 'Exit full screen' : 'Full screen'} onPress={() => { player.play(); if (IS_WEB) { setWide(!wide); return; } setFull(true); setTimeout(() => view.current?.enterFullscreen(), 60); }} scaleTo={0.92}
          style={{ position: 'absolute', right: 14, bottom: 12, width: 44, height: 44, borderRadius: radii.lg, backgroundColor: fixed.white, borderWidth: 1, borderColor: '#C9D1DD', alignItems: 'center', justifyContent: 'center' }}>
          {IS_WEB && wide ? <Minimize2 size={19} color={fixed.dark} /> : <Maximize2 size={19} color={fixed.dark} />}
        </Pressy>`,
`<IconButton label={IS_WEB && wide ? 'Exit full screen' : 'Full screen'} onPress={() => { player.play(); if (IS_WEB) { setWide(!wide); return; } setFull(true); setTimeout(() => view.current?.enterFullscreen(), 60); }} scaleTo={0.92} bg={fixed.white} borderWidth={1} borderColor="#C9D1DD" style={{ position: 'absolute', right: 14, bottom: 12 }}>
          {IS_WEB && wide ? <Minimize2 size={19} color={fixed.dark} /> : <Maximize2 size={19} color={fixed.dark} />}
        </IconButton>`)));
edit('src/features/chat/AudioBubble.tsx', (s) => addImport(rep(s,
`<Pressy accessibilityRole="button" accessibilityLabel={st.playing ? 'Pause voice message' : 'Play voice message'} onPress={toggle} scaleTo={0.9}
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: me ? 'rgba(255,255,255,0.22)' : c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        {st.playing ? <Pause size={18} color={fg} fill={fg} /> : <Play size={18} color={fg} fill={fg} />}
      </Pressy>`,
`<IconButton label={st.playing ? 'Pause voice message' : 'Play voice message'} onPress={toggle} scaleTo={0.9} size={40} radius={20} bg={me ? 'rgba(255,255,255,0.22)' : c.accentSoft}>
        {st.playing ? <Pause size={18} color={fg} fill={fg} /> : <Play size={18} color={fg} fill={fg} />}
      </IconButton>`)));
console.log('done');
