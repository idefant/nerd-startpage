export const modeList = [
  'searchOnGoogle',
  'searchOnYandex',
  'searchOnNpm',
  'searchInHistory',
  'searchInBookmarks',
  'searchInSessions',
  'commandPalette',
] as const;

export type Mode = (typeof modeList)[number];
