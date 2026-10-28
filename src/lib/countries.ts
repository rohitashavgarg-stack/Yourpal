// Country codes for the login phone field. India comes first and is the default; the rest are the places gyms in the programme are most likely to have members from.
export type Country = { name: string; code: string; min: number; max: number };

export const INDIA: Country = { name: 'India', code: '+91', min: 10, max: 10 };

export const COUNTRIES: Country[] = [
  INDIA,
  { name: 'United Arab Emirates', code: '+971', min: 9, max: 9 },
  { name: 'United States', code: '+1', min: 10, max: 10 },
  { name: 'Canada', code: '+1', min: 10, max: 10 },
  { name: 'United Kingdom', code: '+44', min: 10, max: 10 },
  { name: 'Singapore', code: '+65', min: 8, max: 8 },
  { name: 'Australia', code: '+61', min: 9, max: 9 },
  { name: 'Saudi Arabia', code: '+966', min: 9, max: 9 },
  { name: 'Qatar', code: '+974', min: 8, max: 8 },
  { name: 'Nepal', code: '+977', min: 10, max: 10 },
  { name: 'Bangladesh', code: '+880', min: 10, max: 10 },
  { name: 'Sri Lanka', code: '+94', min: 9, max: 9 },
];

/** Is `digits` a whole number for this country? India also checks the first digit (6 to 9). */
export const isValidNumber = (c: Country, digits: string) =>
  c.name === INDIA.name ? /^[6-9]\d{9}$/.test(digits) : digits.length >= c.min && digits.length <= c.max;
