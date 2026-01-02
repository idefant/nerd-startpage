import { FC, useMemo, useRef } from 'react';

import { useDashboardContext } from '#contexts/DashboardContext';
import { CommandKey, commands, commandsMap } from '#data/command';
import { useAppSelector } from '#hooks/reduxHooks';
import { useEditConfig } from '#hooks/useEditConfig';
import { useReloadConfig } from '#hooks/useReloadConfig';
import { useSetConfigUrlFromClipboard } from '#hooks/useSetConfigUrlFromClipboard';
import { useShowConfig } from '#hooks/useShowConfig';
import { useShowIp } from '#hooks/useShowIp';
import { hotkeysCommandList } from '#schema/configSchema';
import { Suggestion } from '#types/suggestionType';
import SuggestionList, { SuggestionListRef } from '#ui/SuggestionList';
import { openUrl } from '#utils/openUrl';

const CommandPaletteSuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.query);
  const setQuery = useDashboardContext((ctx) => ctx.setQuery);
  const setMode = useDashboardContext((ctx) => ctx.setMode);

  const suggestionListRef = useRef<SuggestionListRef>(null);

  const { config } = useAppSelector((state) => state.config);

  const handleShowConfig = useShowConfig();
  const handleEditConfig = useEditConfig();
  const handleReloadConfig = useReloadConfig();
  const handleSetConfigUrlFromClipboard = useSetConfigUrlFromClipboard();
  const handleShowIP = useShowIp();

  // XXX: Вынести в централизованный список хоткеев
  const hotkeys = useMemo(
    () =>
      Object.fromEntries(
        hotkeysCommandList.map((commandKey) => {
          if (config?.mappings?.[commandKey]) {
            return [commandKey, config?.mappings?.[commandKey]];
          }
          if (commandKey in commandsMap && 'hotkey' in commandsMap[commandKey as CommandKey]) {
            return [commandKey, (commandsMap[commandKey as CommandKey] as any).hotkey as string];
          }
          if (commandKey === 'prevSuggestion') {
            return [commandKey, 'ArrowUp'];
          }
          if (commandKey === 'nextSuggestion') {
            return [commandKey, 'ArrowDown'];
          }
          return [commandKey, []];
        }),
      ) as Record<(typeof hotkeysCommandList)[number], string | string[]>,
    [config?.mappings],
  );

  const commandPaletteSuggestions: Suggestion[] = useMemo(
    () =>
      commands
        .filter((command) => !('hideInCommandPalette' in command && command.hideInCommandPalette))
        .filter((command) =>
          query ? command.title.toLowerCase().includes(query.toLowerCase()) : true,
        )
        .map((command) => {
          const hotkeysList = hotkeys[command.key];
          const extra = (() => {
            if (typeof hotkeysList === 'string') {
              return hotkeysList;
            }
            if (hotkeysList.length === 0) return undefined;
            return hotkeysList.join(', ');
          })();

          const applySuggestion = (options?: { newTab?: boolean }) => {
            if ('isMode' in command && command.isMode) {
              setQuery('', true);
              setMode(command.key);
              return;
            }
            if ('url' in command && command.url) {
              openUrl(command.url, options?.newTab);
              return;
            }
            if ('onAction' in command) {
              command.onAction();
              return;
            }
            if ('other' in command && !('hideInCommandPalette' in command)) {
              ({
                showConfig: () => handleShowConfig({ newTab: options?.newTab }),
                editConfig: () => handleEditConfig({ newTab: options?.newTab }),
                reloadConfig: handleReloadConfig,
                setConfigUrlFromClipboard: handleSetConfigUrlFromClipboard,
                showMyIP: handleShowIP,
              })[command.key]();
            }
          };

          return {
            title: command.title,
            extra,
            actions: {
              '': () => applySuggestion(),
              c: () => applySuggestion({ newTab: true }),
            },
          };
        }),
    [
      handleEditConfig,
      handleReloadConfig,
      handleSetConfigUrlFromClipboard,
      handleShowConfig,
      handleShowIP,
      hotkeys,
      query,
      setQuery,
      setMode,
    ],
  );

  return <SuggestionList suggestions={commandPaletteSuggestions} ref={suggestionListRef} />;
};

export default CommandPaletteSuggestions;
