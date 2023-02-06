export const screenNames = {
  home: 'Home',
  accounts: 'Accounts',
} as const;

export type ScreenNames = typeof screenNames;
export type ScreenNameKeys = keyof ScreenNames;
export type ScreenNameValues = ScreenNames[ScreenNameKeys];
