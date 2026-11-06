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
