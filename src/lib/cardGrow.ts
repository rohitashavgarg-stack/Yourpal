import { useRef } from 'react';
import type { ViewInstance } from 'react-native';

// Where the card that was tapped sits on the screen, so the page it opens can grow out of that card and shrink back into it.
// A card calls setCardOrigin just before it navigates; the next SubPage reads it once. A position older than 1.5 seconds is ignored.
export type CardRect = { x: number; y: number; w: number; h: number };
let origin: (CardRect & { at: number }) | null = null;

export function setCardOrigin(r: CardRect) { origin = { ...r, at: Date.now() }; }

export function takeCardOrigin(): CardRect | null {
  const o = origin;
  origin = null;
  return o && Date.now() - o.at < 1500 ? { x: o.x, y: o.y, w: o.w, h: o.h } : null;
}

/**
 * For a card that opens a page and is not a PCard: put `ref` on a View around the card and call `open(() => router.push(...))` instead of navigating directly.
 * The page then grows out of the card.
 */
export function useGrowOpen() {
  const ref = useRef<ViewInstance>(null);
  const open = (go: () => void) => {
    if (ref.current) ref.current.measureInWindow((x, y, w, h) => { setCardOrigin({ x, y, w, h }); go(); });
    else go();
  };
  return { ref, open };
}
