// Demo progress photos: the first (start) and the latest. A real backend would supply the member's own.
export const BEFORE_PHOTO = require('../../../assets/progress/before.jpg');
export const AFTER_PHOTO = require('../../../assets/progress/after.jpg');
export const photoFor = (i: number) => (i === 0 ? BEFORE_PHOTO : AFTER_PHOTO);
