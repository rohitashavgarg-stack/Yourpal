import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

// Storybook for the design system (src/design-system), on the web build of React Native (react-native-web, Vite).
//   npm run storybook          dev server on http://localhost:6006
//   npm run build-storybook    static files in storybook-static/ (see docs/DEPLOY-STORYBOOK.md)
const here = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = (pkg: string) => path.resolve(here, '../node_modules/@expo-google-fonts', pkg);

const config: StorybookConfig = {
  stories: ['../src/design-system/**/*.mdx', '../src/design-system/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      modulesToTranspile: [
        'react-native-reanimated', 'react-native-worklets', 'react-native-gesture-handler', 'react-native-svg', 'react-native-safe-area-context',
        'react-native-screens', 'lucide-react-native', 'expo-linear-gradient', 'expo-blur', 'expo-glass-effect', 'expo-haptics',
        'expo-modules-core', 'expo-font', 'expo-image', 'expo-video', 'expo-location', 'expo-asset', 'expo-constants', 'expo-linking',
      ],
    },
  },
  // the app's fonts, served as files so preview-head.html can declare them under the names the tokens use (Geist_400Regular...)
  staticDirs: [
    { from: fontsDir('geist'), to: '/fonts/geist' },
    { from: fontsDir('geist-mono'), to: '/fonts/geist-mono' },
    { from: fontsDir('outfit'), to: '/fonts/outfit' },
  ],
  viteFinal: async (cfg) => {
    // Metro lets the app load images and clips with require('./x.jpg'); Vite does not, so those become imports here (Storybook only).
    cfg.plugins = [...(cfg.plugins ?? []), {
      name: 'yp-require-assets',
      enforce: 'pre' as const,
      transform(code: string, id: string) {
        if (!/[\\/]src[\\/].*\.(t|j)sx?$/.test(id) || !code.includes('require(')) return null;
        const imports: string[] = [];
        const out = code.replace(/require\((['"])(\.{1,2}\/[^'"]+\.(?:jpe?g|png|webp|gif|mp4))\1\)/g, (_m, _q, p) => {
          const name = `__ypAsset${imports.length}`;
          imports.push(`import ${name} from ${JSON.stringify(p)};`);
          return name;
        });
        return imports.length ? { code: imports.join('\n') + '\n' + out, map: null } : null;
      },
    }];
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = { ...(cfg.resolve.alias as Record<string, string>), '@': path.resolve(here, '../src'), 'expo-router': path.resolve(here, 'mocks/expo-router.tsx') };
    cfg.define = { ...cfg.define, __DEV__: 'false', 'process.env.EXPO_OS': JSON.stringify('web'), 'process.env.NODE_ENV': JSON.stringify('production') };
    return cfg;
  },
};
export default config;
