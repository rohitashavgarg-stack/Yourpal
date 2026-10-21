// The tokens now live in src/design-system/tokens/. This file re-exports them so every existing
// `import { ... } from '@/theme/tokens'` keeps working. New code should import from '@/design-system/tokens'.
export * from '@/design-system/tokens';
