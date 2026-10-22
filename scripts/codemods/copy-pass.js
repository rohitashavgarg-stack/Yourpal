#!/usr/bin/env node
/* One-off: personal, human wording for the Today update cards, reminders, toasts and check-in bar. The new strings live in src/lib/microcopy.ts. */
const fs = require('fs');
const SCR = process.argv[2];
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 100)); return s.replace(a, b); };

// microcopy: append the new blocks once
edit('src/lib/microcopy.ts', (s) => (s.includes('export const updateCopy') ? s : s.trimEnd() + '\n' + fs.readFileSync(SCR + '/mc-add.ts', 'utf8').replace(/\r\n/g, '\n')));

edit('src/features/today/ForYou.tsx', (s) => {
  s = rep(s, "title: 'Confirm your PT session', body: 'Coach Vikram marked Tue 23 Sep, 6–7 pm as done. It confirms itself on Fri 26 Sep.',", "title: updateCopy.pt.title, body: updateCopy.pt.body,");
  s = rep(s, "title: 'Membership ends in 12 days', body: 'Expires on 6 Oct. Renew at Wulf Fitness reception.',", "title: updateCopy.membership.title, body: updateCopy.membership.body,");
  s = rep(s, "title: 'Log your ' + meal.n.toLowerCase(), body: late ? 'It was due at ' + fmtT(meal.t).full + '. Log it, or skip it if you missed it.' : 'It is time for ' + meal.n.toLowerCase() + '. Log it when you eat.',", "...updateCopy.meal(meal.n, first, fmtT(meal.t).full, late),");
  s = rep(s, "title: 'Log your workout', body: 'Leg day was planned for ' + fmtT(planned).full + '. Log it if you trained, or skip it.',", "...updateCopy.workout(first, fmtT(planned).full),");
  s = rep(s, "title: 'Log your water', body: r.text,", "...updateCopy.water(first, reminderStore.get().waterAt == null ? null : fmtT(reminderStore.get().waterAt!).full),");
  s = rep(s, "toast('Added 250 ml')", "toast(toastCopy.glassAdded)");
  s = rep(s, "title: 'Log your weight', body: r.text,", "...updateCopy.weight(first, goalCardStore.get().weighDays),");
  s = rep(s, "title: 'Steps are behind', body: \"A short walk catches you up today.\",", "...updateCopy.steps(first),");
  s = rep(s, "  const { state } = useStore();\n  const startWorkout = useStartWorkout();\n  const missedWk", "  const { state } = useStore();\n  const first = (state.profile.name || '').trim().split(' ')[0];\n  const startWorkout = useStartWorkout();\n  const missedWk");
  s = s.replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, "$1import { toastCopy, updateCopy } from '@/lib/microcopy';\nimport { goalCardStore } from './goalCardState';\n");
  return s;
});

edit('src/features/today/TopCards.tsx', (s) => {
  s = rep(s, "{ key: 'plan', title: 'Coach Vikram updated your plan', body: 'Leg day: lunges added, leg extension removed', isPlan: true,", "{ key: 'plan', ...updateCopy.plan, isPlan: true,");
  s = rep(s, "{ key: 'reply', title: 'Coach Vikram replied', body: '“Keep your back straight on rows.”', btn: 'Reply',", "{ key: 'reply', ...updateCopy.reply, btn: 'Reply',");
  s = rep(s, "{ key: 'reassess', title: 'Reassessment due', body: 'Book it at the front desk this week.',", "{ key: 'reassess', ...updateCopy.reassess(first),");
  s = rep(s, "{ key: 'member', title: 'Membership', body: 'Expires in 12 days. Renew at the front desk.',", "{ key: 'member', ...updateCopy.memberSoon,");
  s = rep(s, "{ key: 'log', title: 'Checked in at 6:42 pm', body: \"Log today's workout?\", btn: 'Log workout',", "{ key: 'log', ...updateCopy.checkedIn(first, '6:42 pm'), btn: 'Log workout',");
  s = rep(s, "  const isPT = state.sc.member === 'PT member';\n  const all: Upd[]", "  const isPT = state.sc.member === 'PT member';\n  const first = (state.profile.name || '').trim().split(' ')[0];\n  const all: Upd[]");
  s = s.replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, "$1import { updateCopy } from '@/lib/microcopy';\n");
  return s;
});

edit('src/features/today/MealsCard.tsx', (s) => {
  s = rep(s, "withUndo(`${m.n} done, +${mealKcal(m)} kcal`,", "withUndo(toastCopy.mealDone(m.n, mealKcal(m)),");
  s = rep(s, "withUndo(`Removed ${gone?.n ?? 'item'}`,", "withUndo(toastCopy.removed(gone?.n ?? 'item'),");
  s = rep(s, "withUndo(`${m.n} done`, () => patch(shown, { eaten:", "withUndo(toastCopy.mealMarked(m.n), () => patch(shown, { eaten:");
  s = rep(s, "withUndo(`${m.n} skipped`, () => patch(shown, { skip: true", "withUndo(toastCopy.mealSkipped(m.n), () => patch(shown, { skip: true");
  s = rep(s, "answer(ask, `${askMeal!.n} logged as planned`,", "answer(ask, toastCopy.mealAsPlanned(askMeal!.n),");
  s = rep(s, "answer(ask, `${askMeal!.n} skipped`,", "answer(ask, toastCopy.mealSkipped(askMeal!.n),");
  s = rep(s, "completeLine={`All ${MEALS.length} meals logged. Protein ${t.p} of ${MACRO_TARGET.p} g.`}", "completeLine={`All ${MEALS.length} meals logged today. Protein is at ${t.p} of ${MACRO_TARGET.p} g.`}");
  s = s.replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, "$1import { toastCopy } from '@/lib/microcopy';\n");
  return s;
});

edit('src/design-system/patterns/MealsCard.tsx', (s) => {
  s = rep(s, "{`${ask.name} wasn't logged`}", "{`Did you have ${n}?`}");
  s = rep(s, "{ask.more ? `Planned for ${ask.planned}. ${ask.more} more to catch up.` : `Planned for ${ask.planned}`}", "{ask.more ? `It was planned for ${ask.planned}. ${ask.more} earlier ${ask.more === 1 ? 'meal' : 'meals'} still to log.` : `It was planned for ${ask.planned}.`}");
  return s;
});

edit('src/features/today/WorkoutCard.tsx', (s) => {
  s = rep(s, "toast('Logged as done',", "toast(toastCopy.workoutLogged,");
  s = rep(s, "toast(a === 'moved' ? 'Moved to tomorrow. Coach Vikram is told.' : 'Skipped today',", "toast(a === 'moved' ? toastCopy.workoutMoved : toastCopy.workoutSkipped,");
  s = s.replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, "$1import { toastCopy } from '@/lib/microcopy';\n");
  return s;
});

edit('src/features/reminders/reminders.ts', (s) => {
  s = rep(s, "text: `${m.n} is not logged yet`", "text: reminderText.mealMissed(m.n)");
  s = rep(s, "text: rs.waterAt == null ? 'No water logged today' : `No water since ${fmtT(rs.waterAt).full}`", "text: rs.waterAt == null ? reminderText.waterNone : reminderText.waterSince(fmtT(rs.waterAt).full)");
  s = rep(s, "text: `Last weighed ${weighDays} days ago`", "text: reminderText.weight(weighDays)");
  s = rep(s, "text: \"Steps are behind today's pace\"", "text: reminderText.steps");
  s = s.replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, "$1import { reminderText } from '@/lib/microcopy';\n");
  return s;
});

edit('src/features/today/CheckInBar.tsx', (s) => {
  s = rep(s, "title = here ? \"You're at Wulf Fitness\" : \"Almost at Wulf Fitness\";", "title = here ? 'You made it to Wulf Fitness' : 'Almost at Wulf Fitness';");
  s = rep(s, "sub = here ? 'Inside the 20 m check-in area' : '25 m away · check-in opens within 20 m';", "sub = here ? 'You are inside the check-in area' : 'You are 25 m away. Check-in opens at 20 m.';");
  s = rep(s, "title = 'Checked in';", "title = 'You are checked in';");
  s = rep(s, "sub = `Since ${fmtT(at!).full} · ${st === 'todo' ? 'Leg day is next' : st === 'done' ? 'Workout done' : 'Rest day'}`;", "sub = `Since ${fmtT(at!).full}. ${st === 'todo' ? 'Leg day is next.' : st === 'done' ? 'Workout done.' : 'Rest day.'}`;");
  s = rep(s, "title = `Checked out ${fmtT(o.at).full}`;", "title = `You checked out at ${fmtT(o.at).full}`;");
  s = rep(s, "sub = `${o.mins} min at the gym${o.auto === 'time' ? ' · automatic' : o.auto === 'left' ? ' · you left the gym' : ''}`;", "sub = `${o.mins} minutes at the gym.${o.auto === 'time' ? ' Checked out automatically.' : o.auto === 'left' ? ' You left the gym.' : ''}`;");
  s = rep(s, "title = 'Location is off'; sub = 'Turn it on to check in · front desk can also mark you';", "title = 'Location is off'; sub = 'Turn it on to check in, or ask the front desk to mark you.';");
  return s;
});
console.log('copy pass done');
