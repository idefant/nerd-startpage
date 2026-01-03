import { FC, useMemo, useRef } from 'react';

import { useDashboardContext } from '#contexts/DashboardContext';
import { useAppSelector } from '#hooks/reduxHooks';
import { useCommands } from '#hooks/useCommands';
import { useEditConfig } from '#hooks/useEditConfig';
import { useModes } from '#hooks/useModes';
import { useReloadConfig } from '#hooks/useReloadConfig';
import { useSetConfigUrlFromClipboard } from '#hooks/useSetConfigUrlFromClipboard';
import { useShowConfig } from '#hooks/useShowConfig';
import { useShowIp } from '#hooks/useShowIp';
import { Suggestion } from '#types/suggestionType';
import SuggestionList, { SuggestionListRef } from '#ui/SuggestionList';
import { openGoogle } from '#utils/commands/openGoogle';
import { openLinkFromClipboard } from '#utils/commands/openLinkFromClipboard';
import { openYandex } from '#utils/commands/openYandex';
import { searchFromClipboard } from '#utils/commands/searchFromClipboard';
import { ModifiersOnlyEvent } from '#utils/modifiers';

const CommandPaletteSuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.query);
  const setMode = useDashboardContext((ctx) => ctx.setMode);
  const setQuery = useDashboardContext((ctx) => ctx.setQuery);

  const config = useAppSelector((state) => state.config.config);

  const suggestionListRef = useRef<SuggestionListRef>(null);

  const { modesInCommandPalette } = useModes();
  const { commandsInCommandPalette } = useCommands();

  const showConfig = useShowConfig();
  const editConfig = useEditConfig();
  const reloadConfig = useReloadConfig();
  const setConfigUrlFromClipboard = useSetConfigUrlFromClipboard();
  const showMyIP = useShowIp();

  const modeSuggestions: Suggestion[] = useMemo(
    () =>
      modesInCommandPalette
        .filter((mode) => (query ? mode.title.toLowerCase().includes(query.toLowerCase()) : true))
        .map((mode) => {
          const hotkeys = typeof mode.hotkey === 'string' ? [mode.hotkey] : mode.hotkey;
          const leaderSequences = (
            typeof mode.leaderSequence === 'string' ? [mode.leaderSequence] : mode.leaderSequence
          ).map((leaderSequence) => `${config.leaderKey}${leaderSequence}`);
          const extra = [...hotkeys, ...leaderSequences].join(', ');

          return {
            title: mode.title,
            extra,
            actions: {
              '': () => setMode(mode.key),
            },
          };
        }),
    [config.leaderKey, modesInCommandPalette, query, setMode],
  );

  const commandSuggestions: Suggestion[] = useMemo(
    () =>
      commandsInCommandPalette
        .filter((command) =>
          query ? command.title.toLowerCase().includes(query.toLowerCase()) : true,
        )
        .map((command) => {
          const hotkeys = typeof command.hotkey === 'string' ? [command.hotkey] : command.hotkey;
          const leaderSequences = (
            typeof command.leaderSequence === 'string'
              ? [command.leaderSequence]
              : command.leaderSequence
          ).map((leaderSequence) => `${config.leaderKey}${leaderSequence}`);
          const extra = [...hotkeys, ...leaderSequences].join(', ');

          const applySuggestion = (e: ModifiersOnlyEvent) => {
            ({
              nextSuggestion: () => {},
              prevSuggestion: () => {},
              clearInput: () => setQuery('', true),
              openLinkFromClipboard: () => openLinkFromClipboard({ newTab: e.ctrlKey }),
              openGoogle: () => openGoogle({ newTab: e.ctrlKey }),
              openYandex: () => openYandex({ newTab: e.ctrlKey }),
              searchOnGoogleFromClipboard: () =>
                searchFromClipboard({ engine: 'google', newTab: e.ctrlKey }),
              searchOnYandexFromClipboard: () =>
                searchFromClipboard({ engine: 'yandex', newTab: e.ctrlKey }),
              showConfig: () => showConfig({ newTab: e.ctrlKey }),
              editConfig: () => editConfig({ newTab: e.ctrlKey }),
              reloadConfig: () => reloadConfig(),
              setConfigUrlFromClipboard,
              showMyIP,
            })[command.key]();
          };

          return {
            title: command.title,
            extra,
            actions: {
              '': applySuggestion,
              c: applySuggestion,
            },
          };
        }),
    [
      commandsInCommandPalette,
      config.leaderKey,
      editConfig,
      query,
      reloadConfig,
      setConfigUrlFromClipboard,
      setQuery,
      showConfig,
      showMyIP,
    ],
  );

  return (
    <SuggestionList
      suggestions={[...modeSuggestions, ...commandSuggestions]}
      ref={suggestionListRef}
    />
  );
};

export default CommandPaletteSuggestions;
