// Where the next screen should grow from: the card that was tapped, in window coordinates.
// A card calls zoomFrom(ref) just before router.push; the zooming screen takes it once when it opens.
type Rect = { x: number; y: number; w: number; h: number };
let origin: Rect | null = null;

export function zoomFrom(node: any): Promise<void> {
  return new Promise((resolve) => {
    if (!node) { origin = null; resolve(); return; }
    if (typeof node.getBoundingClientRect === 'function') { // web
      const r = node.getBoundingClientRect();
      origin = { x: r.left, y: r.top, w: r.width, h: r.height };
      resolve();
      return;
    }
    if (typeof node.measureInWindow === 'function') {
      node.measureInWindow((x: number, y: number, w: number, h: number) => { origin = w ? { x, y, w, h } : null; resolve(); });
      return;
    }
    origin = null;
    resolve();
  });
}

export function takeOrigin(): Rect | null {
  const o = origin;
  origin = null;
  return o;
}
