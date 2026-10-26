// Development only: lets the screenshot scripts open the web app in a given state by URL, for example
//   /plans?signedin=1&dom={"membership":"Expired"}      a domain patch (src/lib/domain.tsx)
//   /login?sc={"net":"Offline"}                          a scenario patch (src/lib/store.tsx)
//   /onboarding?signedin=1&app={"onboarded":false,"onboardingStep":"goal"}   an app state patch
//   &prof={"goal":"Weight loss"}                         a profile patch
//   &stores={"plans":{"noPlan":true},"progress":{"data":"New member"}}   a patch for a module store: plans, progress, gym, streak, coach, push
// Values are JSON. Does nothing in a production build or off the web.
export function devParam<T = Record<string, unknown>>(key: 'dom' | 'sc' | 'app' | 'prof' | 'stores'): T | undefined {
  if (!__DEV__ || typeof location === 'undefined') return undefined;
  const m = location.search.match(new RegExp('[?&]' + key + '=([^&]*)'));
  if (!m) return undefined;
  try { return JSON.parse(decodeURIComponent(m[1])) as T; } catch { return undefined; }
}
