# PageEnd

`src/design-system/patterns/PageEnd.tsx`. Storybook: Patterns / PageEnd.

## Purpose

The last thing on a long page. A subtle illustration (drawn at 55% so it stays quiet) that fades into the page colour at its foot, with the line sitting on the fade. An illustration (`assets/illustrations/today-end.webp`, a member lacing up trainers beside a bag, a bottle and a mat), a big quiet line under it and the YourPal mark. The page ends with a picture and not with a card. It follows the way District closes its home page.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `line` | string | "Your pace." and "Your pal." on two lines | The quiet line under the picture. `\n` starts a new line |

## States

One state. It has no tap, no button and no state of its own. The picture is decorative and hidden from screen readers.

## Do and don't

- Do put it below the last card of the page and inside the scroll, so it moves with the page. Never fix it to the screen.
- Do keep the line short, two lines at most, with no dot separators and no emoji.
- Don't add a button or a link to it.
- Don't recolour the picture. It is drawn in blue with orange edges for dark mode; in a light theme check it on the page background first.
- Used at the bottom of Today. A second page needs the owner's say first.
