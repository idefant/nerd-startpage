export const modeList = [
  'searchOnGoogle',
  'searchOnYandex',
  'searchOnNpm',
  'searchInHistory',
  'searchInBookmarks',
  'searchInSessions',
  'searchInLinks',
  'commandPalette',
] as const;

export type Mode = (typeof modeList)[number];
