import { toast } from 'react-toastify';

import { ToTuple } from '#types/basicType';
import { checkIsValidUrl } from '#utils/checkIsValidUrl';
import { getGoogleSearchUrl, getYandexSearchUrl } from '#utils/getSearchEngineUrl';
import { getTextFromClipboard } from '#utils/getTextFromClipboard';
import { openUrl } from '#utils/openUrl';

import { modeList } from './mode';

// XXX: Разбить отдельно на активацию модов и хоткеи для команд
export const commandKeys = [
  ...modeList,
  'clearInput',
  'openLinkFromClipboard',
  'openGoogle',
  'openYandex',
  'searchOnGoogleFromClipboard',
  'searchOnYandexFromClipboard',
  'editConfig',
  'showConfig',
  'reloadConfig',
  'setConfigUrlFromClipboard',
  'showMyIP',
] as const;

export type CommandKey = (typeof commandKeys)[number];

export type Command = {
  title: string;
  hotkey?: string;
  hideInCommandPalette?: boolean;
} & (
  | {
      isMode: boolean;
      icon: string;
      url?: undefined;
      onAction?: undefined;
    }
  | ({
      isMode?: undefined;
      icon?: undefined;
    } & (
      | {
          url: string;
          onAction?: undefined;
          other?: undefined;
        }
      | {
          url?: undefined;
          onAction: () => void;
          other?: undefined;
        }
      | {
          url?: undefined;
          onAction?: undefined;
          other: boolean;
        }
    ))
);

export const commandsMap = {
  searchOnGoogle: { title: 'Search on Google', hotkey: 'ctrl+g', isMode: true, icon: '' },
  searchOnYandex: { title: 'Search on Yandex', hotkey: 'ctrl+y', isMode: true, icon: '' },
  searchOnNpm: { title: 'Search on NPM', isMode: true, icon: '' },
  searchInHistory: { title: 'Search in History', hotkey: 'ctrl+h', isMode: true, icon: '' },
  searchInBookmarks: { title: 'Search in Bookmarks', hotkey: 'ctrl+b', isMode: true, icon: '' },
  searchInSessions: { title: 'Search in Sessions', hotkey: 'ctrl+s', isMode: true, icon: '󰭌' },
  searchInLinks: { title: 'Search in Links', hotkey: 'ctrl+f', isMode: true, icon: '󱐋' },
  commandPalette: {
    title: 'Command Palette',
    hotkey: 'ctrl+p',
    isMode: true,
    icon: '',
    hideInCommandPalette: true,
  },
  clearInput: {
    title: 'Clear Input',
    hotkey: 'ctrl+l',
    hideInCommandPalette: true,
    other: true,
  },
  openLinkFromClipboard: {
    title: 'Open link from clipboard',
    hotkey: 'ctrl+o',
    onAction: async () => {
      const url = await getTextFromClipboard();
      if (!url) return;
      const urlValidationResult = checkIsValidUrl(url);
      if (!urlValidationResult.success) {
        toast.error('URL from clipboard is invalid');
        return;
      }
      openUrl(urlValidationResult.url);
    },
  },
  openGoogle: { title: 'Open Google', url: 'https://google.com' },
  openYandex: { title: 'Open Yandex', url: 'https://ya.ru' },
  searchOnGoogleFromClipboard: {
    title: 'Search on Google from clipboard',
    onAction: async () => {
      const query = await getTextFromClipboard();
      if (!query) return;
      openUrl(getGoogleSearchUrl(query));
    },
  },
  searchOnYandexFromClipboard: {
    title: 'Search on Yandex from clipboard',
    onAction: async () => {
      const query = await getTextFromClipboard();
      if (!query) return;
      openUrl(getYandexSearchUrl(query));
    },
  },
  editConfig: { title: 'Edit config', other: true },
  showConfig: { title: 'Show config', other: true },
  reloadConfig: {
    title: 'Reload config',
    other: true,
  },
  setConfigUrlFromClipboard: {
    title: 'Set config url from clipboard',
    other: true,
  },
  showMyIP: {
    title: 'Show my IP',
    other: true,
  },
} satisfies Record<CommandKey, Command>;

export type Commands = ToTuple<typeof commandKeys, typeof commandsMap>;

export const commands = commandKeys.map((commandKey) => ({
  key: commandKey,
  ...commandsMap[commandKey],
})) as any as Commands;
