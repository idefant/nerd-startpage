export const modeList = [
  'searchOnGoogle',
  'searchOnYandex',
  'searchInHistory',
  'searchInBookmarks',
  'searchInSessions',
  'commandPalette',
] as const;

export type Mode = (typeof modeList)[number];
