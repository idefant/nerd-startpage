import { modesSchema } from '#schema/configSchema';
import { Mode, ModeName } from '#types/modeType';

export const modeNameList = modesSchema.unwrap().keyof().options;

export const modeMap: Record<ModeName, Mode> = {
  google: { title: 'Search on Google', icon: '' },
  yandex: { title: 'Search on Yandex', icon: '' },
  npm: { title: 'Search on NPM', icon: '' },
  history: { title: 'Search in History', icon: '' },
  bookmarks: { title: 'Search in Bookmarks', icon: '' },
  sessions: { title: 'Search in Sessions', icon: '󰭌' },
  links: { title: 'Search in Links', icon: '󱐋' },
  commandPalette: { title: 'Command Palette', icon: '' },
};
