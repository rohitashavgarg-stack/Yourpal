import { Linking } from 'react-native';

// The two legal pages live on the YourPal website. Change an address here and every place that opens it follows.
// The privacy page is published under the spelling "privay-and-policy", so keep it as it is on the site.
export const LEGAL_LINKS = {
  privacy: 'https://www.yrpal.com/privay-and-policy/',
  terms: 'https://www.yrpal.com/terms-and-conditions/',
} as const;

export type LegalKind = keyof typeof LEGAL_LINKS;

// Opens the page in the phone's browser. onFail runs if the phone cannot open it.
export function openLegal(kind: LegalKind, onFail?: () => void) {
  Linking.openURL(LEGAL_LINKS[kind]).catch(() => onFail?.());
}
