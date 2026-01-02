import { commandsSchema } from '#schema/configSchema';
import { Command, CommandName } from '#types/commandType';

export const commandNameList = commandsSchema.unwrap().keyof().options;

export const commandsMap: Record<CommandName, Command> = {
  nextSuggestion: {
    title: 'Next Suggestion',
  },
  prevSuggestion: {
    title: 'Previous Suggestion',
  },
  clearInput: {
    title: 'Clear Input',
  },
  openLinkFromClipboard: {
    title: 'Open link from clipboard',
  },
  openGoogle: {
    title: 'Open Google',
  },
  openYandex: {
    title: 'Open Yandex',
  },
  searchOnGoogleFromClipboard: {
    title: 'Search on Google from clipboard',
  },
  searchOnYandexFromClipboard: {
    title: 'Search on Yandex from clipboard',
  },
  editConfig: {
    title: 'Edit config',
  },
  showConfig: {
    title: 'Show config',
  },
  reloadConfig: {
    title: 'Reload config',
  },
  setConfigUrlFromClipboard: {
    title: 'Set config url from clipboard',
  },
  showMyIP: {
    title: 'Show my IP',
  },
};
