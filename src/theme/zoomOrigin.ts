// Where the next screen should grow from, in window coordinates (the reference video: a page grows out of what you tapped).
//  - Every Pressy records its own position when pressed (auto), so any page opens from the button or card that opened it.
//  - A card can set itself on purpose with zoomFrom(ref) (pinned): it wins over the buttons pressed after it for a while,
//    e.g. Start workout on the card, then Start in the sheet: the workout still grows out of the card.
// The zooming screen takes it once when it opens; an old one is ignored.
type Rect = { x: number; y: number; w: number; h: number };
let origin: { r: Rect; at: number; pinned: boolean } | null = null;
const AUTO_MS = 1500, PINNED_MS = 20000;

function measure(node: any, cb: (r: Rect | null) => void) {
  if (!node) return cb(null);
  if (typeof node.getBoundingClientRect === 'function') { // web
    const r = node.getBoundingClientRect();
    return cb(r.width ? { x: r.left, y: r.top, w: r.width, h: r.height } : null);
  }
  if (typeof node.measureInWindow === 'function') {
    node.measureInWindow((x: number, y: number, w: number, h: number) => cb(w ? { x, y, w, h } : null));
    return;
  }
  cb(null);
}

const fresh = () => !!origin && Date.now() - origin.at < (origin.pinned ? PINNED_MS : AUTO_MS);

// a card sets itself as where the next page grows from
export function zoomFrom(node: any): Promise<void> {
  return new Promise((resolve) => measure(node, (r) => { origin = r ? { r, at: Date.now(), pinned: true } : null; resolve(); }));
}

// any pressed button / card (called by Pressy); never replaces a pinned card
export function notePress(node: any) {
  if (origin?.pinned && fresh()) return;
  measure(node, (r) => { if (r && !(origin?.pinned && fresh())) origin = { r, at: Date.now(), pinned: false }; });
}

export function takeOrigin(): Rect | null {
  const o = fresh() ? origin!.r : null;
  origin = null;
  return o;
}
