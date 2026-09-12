import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

import { useDashboardContext } from '#contexts/DashboardContext';
import { openGoogle } from '#utils/commands/openGoogle';
import { openLinkFromClipboard } from '#utils/commands/openLinkFromClipboard';
import { openYandex } from '#utils/commands/openYandex';
import { searchFromClipboard } from '#utils/commands/searchFromClipboard';
import { ModifiersOnlyEvent } from '#utils/modifiers';

import { useAppSelector } from './reduxHooks';
import { useCommands } from './useCommands';
import { useEditConfig } from './useEditConfig';
import { useModes } from './useModes';
import { useReloadConfig } from './useReloadConfig';
import { useSetConfigUrlFromClipboard } from './useSetConfigUrlFromClipboard';
import { useShowConfig } from './useShowConfig';
import { useShowIp } from './useShowIp';

export const useLeaderSequence = () => {
  const query = useDashboardContext((ctx) => ctx.query);
  const setMode = useDashboardContext((ctx) => ctx.setMode);
  const setQuery = useDashboardContext((ctx) => ctx.setQuery);

  const config = useAppSelector((state) => state.config.config);

  const { detailedModes } = useModes();
  const { detailedCommands } = useCommands();

  const showConfig = useShowConfig();
  const editConfig = useEditConfig();
  const reloadConfig = useReloadConfig();
  const setConfigUrlFromClipboard = useSetConfigUrlFromClipboard();
  const showMyIP = useShowIp();

  const isLeaderSequence = useMemo(() => {
    if (!config.leaderKey) return false;
    return query.startsWith(config.leaderKey);
  }, [config.leaderKey, query]);

  const applyLeaderSequence = useCallback(
    (e: ModifiersOnlyEvent) => {
      if (!isLeaderSequence) return;
      const leaderSequence = query.slice(config.leaderKey?.length);

      const foundMode = detailedModes.find((mode) =>
        typeof mode.leaderSequence === 'string'
          ? mode.leaderSequence === leaderSequence
          : mode.leaderSequence.includes(leaderSequence),
      );
      if (foundMode) {
        setMode(foundMode.key);
        setQuery('', true);
        return;
      }

      const foundCommand = detailedCommands.find((command) =>
        typeof command.leaderSequence === 'string'
          ? command.leaderSequence === leaderSequence
          : command.leaderSequence.includes(leaderSequence),
      );
      if (foundCommand) {
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
        })[foundCommand.key]();
        setQuery('', true);
        return;
      }

      toast.error('Leader команды не существует');
    },
    [
      config.leaderKey?.length,
      detailedCommands,
      detailedModes,
      editConfig,
      isLeaderSequence,
      query,
      reloadConfig,
      setConfigUrlFromClipboard,
      setMode,
      setQuery,
      showConfig,
      showMyIP,
    ],
  );

  return { isLeaderSequence, applyLeaderSequence };
};
