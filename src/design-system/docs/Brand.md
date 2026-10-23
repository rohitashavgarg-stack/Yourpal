# Brand

`src/design-system/primitives/Brand.tsx`

## Purpose

Three marks for who and where. `GymLogoMark` is the gym logo in a rounded square (corner 28% of the size). `PersonAvatar` is the member or Coach Vikram: photo if there is one, initials if not, with the gold `PremiumBadge` on a PT member. `Photo` is the image with a fallback.

```tsx
<GymLogoMark size={40} />
<PersonAvatar who="coach" size={44} ring />
<PremiumBadge size={18} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `GymLogoMark.size` | number | 40 | Side of the square |
| `PersonAvatar.who` | `me \| coach` | `me` | Whose face |
| `PersonAvatar.size` | number | 44 | Diameter |
| `PersonAvatar.ring` | boolean | false | 2 px ring in the surface colour, for stacking |
| `PersonAvatar.square` | boolean | false | Rounded square instead of a circle |
| `PersonAvatar.photo` | string or null | profile photo | A photo for this one |
| `PremiumBadge.size` | number | 18 | Diameter of the gold crown badge |

## States

| State | Look |
|---|---|
| photo | the photo, clipped |
| no photo | initials on `accent` (member) or "V" on `accentSoft` (coach) |
| PT member, 36 px or more | the premium badge at the bottom right |
| logo image fails | a sand "W" on black |

## Do and don't

- Do use `PersonAvatar who="coach"` wherever Coach Vikram is credited.
- Don't draw initials by hand.

## Accessibility

- Labelled "You", "Coach Vikram", "Wulf Fitness", "Premium, personal training member". Photos ignore colour inversion.

## Copy rules

- The coach is credited by name: "Coach Vikram".

Moved here from `components/Brand.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
