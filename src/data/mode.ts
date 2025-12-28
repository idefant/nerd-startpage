import { type Mode } from '#types/modeType';

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

export const defaultMode: Mode = 'searchOnGoogle';
