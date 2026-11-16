import { useRef } from 'react';
import type { ViewInstance } from 'react-native';

// Where the card that was tapped sits on the screen, so the page it opens can grow out of that card and shrink back into it.
// The card measures itself when the finger goes down (not when it lifts), so the position is ready before the page opens and the tap never waits.
// The next SubPage reads it once. A position older than 3 seconds is ignored.
export type CardRect = { x: number; y: number; w: number; h: number };
let origin: (CardRect & { at: number }) | null = null;

export function setCardOrigin(r: CardRect) { origin = { ...r, at: Date.now() }; }

export function takeCardOrigin(): CardRect | null {
  const o = origin;
  origin = null;
  return o && Date.now() - o.at < 3000 ? { x: o.x, y: o.y, w: o.w, h: o.h } : null;
}

/** Measure a view and remember where it is. */
export function rememberCard(view: ViewInstance | null) {
  if (view) view.measureInWindow((x, y, w, h) => { if (w > 0 && h > 0) setCardOrigin({ x, y, w, h }); });
}

/**
 * For a card that opens a page and is not a PCard: put `ref` on a View around the card and `prime` on the card's onPressIn (or the View's onTouchStart),
 * and navigate as usual. The page then grows out of the card.
 */
export function useGrowOpen() {
  const ref = useRef<ViewInstance>(null);
  const prime = () => rememberCard(ref.current);
  const open = (go: () => void) => go();
  return { ref, prime, open };
}

// The pages a card opens with the grow animation. Only these take the card's position: a detail page opened from inside one of them (a membership, an assessment)
// is a normal page with a back button and slides in as before.
export const CARD_PAGES = ['progress/streaks', 'progress/metric', 'progress/lift', 'progress/photos', 'progress/muscles', 'gym/attendance', 'gym/assessments', 'gym/membership', 'gym/pt', 'log-chat'];
export const isCardPage = (path: string) => CARD_PAGES.includes(path.startsWith('/') ? path.slice(1) : path);
