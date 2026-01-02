import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HotkeysProvider, useHotkeys } from 'react-hotkeys-hook';

import BookmarkSuggestions from '#components/BookmarkSuggestions';
import CommandPaletteSuggestions from '#components/CommandPaletteSuggestions/CommandPaletteSuggestions';
import GoogleSuggestions from '#components/GoogleSuggestions';
import HistorySuggestions from '#components/HistorySuggestions';
import LinkSuggestions from '#components/LinkSuggestions';
import NpmSuggestions from '#components/NpmSuggestions';
import SessionSuggestions from '#components/SessionSuggestions';
import YandexSuggestions from '#components/YandexSuggestions';
import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { DashboardContext } from '#contexts/DashboardContext';
import { CommandKey, commandsMap } from '#data/command';
import { defaultMode } from '#data/mode';
import { useAppSelector } from '#hooks/reduxHooks';
import { useDebounceState } from '#hooks/useDebounceState';
import { useEditConfig } from '#hooks/useEditConfig';
import { useReloadConfig } from '#hooks/useReloadConfig';
import { useSetConfigUrlFromClipboard } from '#hooks/useSetConfigUrlFromClipboard';
import { useShowConfig } from '#hooks/useShowConfig';
import { useShowIp } from '#hooks/useShowIp';
import { hotkeysCommandList } from '#schema/configSchema';
import { Mode } from '#types/modeType';
import { CategoryGrid } from '#ui/CategoryGrid';
import { openUrl } from '#utils/openUrl';

import cls from './DashboardPage.module.scss';

export const DashboardPage: FC = () => {
  const { config } = useAppSelector((state) => state.config);

  const [mode, setMode] = useState<Mode>(config?.defaultMode ?? defaultMode);
  const [query, debouncedQuery, setQuery] = useDebounceState('', 300);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleShowConfig = useShowConfig();
  const handleEditConfig = useEditConfig();
  const handleReloadConfig = useReloadConfig();
  const handleSetConfigUrlFromClipboard = useSetConfigUrlFromClipboard();
  const handleShowIP = useShowIp();

  // XXX: Делать определение хоткеев попроще. Синхронизировать с хоткеями в SuggestionList
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

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  // === Mode Hotkeys ===
  useHotkeys(hotkeys.searchOnGoogle, () => setMode('searchOnGoogle'), hotkeyHookConfig);
  useHotkeys(hotkeys.searchOnYandex, () => setMode('searchOnYandex'), hotkeyHookConfig);
  useHotkeys(hotkeys.searchOnNpm, () => setMode('searchOnNpm'), hotkeyHookConfig);
  useHotkeys(hotkeys.searchInHistory, () => setMode('searchInHistory'), hotkeyHookConfig);
  useHotkeys(hotkeys.searchInBookmarks, () => setMode('searchInBookmarks'), hotkeyHookConfig);
  useHotkeys(hotkeys.searchInSessions, () => setMode('searchInSessions'), hotkeyHookConfig);
  useHotkeys(hotkeys.searchInLinks, () => setMode('searchInLinks'), hotkeyHookConfig);
  useHotkeys(hotkeys.commandPalette, () => setMode('commandPalette'), hotkeyHookConfig);

  // === Other Hotkeys ===
  useHotkeys(hotkeys.clearInput, () => setQuery('', true), hotkeyHookConfig);
  useHotkeys(
    hotkeys.openLinkFromClipboard,
    commandsMap.openLinkFromClipboard.onAction,
    hotkeyHookConfig,
  );
  useHotkeys(
    hotkeys.openGoogle,
    (e) => openUrl(commandsMap.openGoogle.url, e?.ctrlKey),
    hotkeyHookConfig,
  );
  useHotkeys(
    hotkeys.openYandex,
    (e) => openUrl(commandsMap.openYandex.url, e?.ctrlKey),
    hotkeyHookConfig,
  );
  useHotkeys(
    hotkeys.searchOnGoogleFromClipboard,
    commandsMap.searchOnGoogleFromClipboard.onAction,
    hotkeyHookConfig,
  );
  useHotkeys(
    hotkeys.searchOnYandexFromClipboard,
    commandsMap.searchOnYandexFromClipboard.onAction,
    hotkeyHookConfig,
  );
  useHotkeys(hotkeys.showConfig, () => handleShowConfig(), hotkeyHookConfig, [handleShowConfig]);
  useHotkeys(hotkeys.editConfig, () => handleEditConfig(), hotkeyHookConfig, [handleEditConfig]);
  useHotkeys(hotkeys.reloadConfig, () => handleReloadConfig(), hotkeyHookConfig, [
    handleReloadConfig,
  ]);
  useHotkeys(hotkeys.setConfigUrlFromClipboard, handleSetConfigUrlFromClipboard, hotkeyHookConfig, [
    handleSetConfigUrlFromClipboard,
  ]);
  useHotkeys(hotkeys.showMyIP, handleShowIP, hotkeyHookConfig, [handleShowIP]);

  const handleChangeInputValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const immediately = !e.target.value;
      setQuery(e.target.value, immediately);
    },
    [setQuery],
  );

  const dashboardContextValue = useMemo(
    () => ({ query, debouncedQuery, setQuery, setMode, inputRef }),
    [query, debouncedQuery, setQuery, setMode, inputRef],
  );

  return (
    <DashboardContext.Provider value={dashboardContextValue}>
      <div className={cls.container}>
        <HotkeysProvider initiallyActiveScopes={['suggestions']}>
          <div className={cls.search}>
            <div className={cls.inputBox}>
              <div className={cls.inputIcon}>{commandsMap[mode].icon}</div>
              <input
                className={cls.inputField}
                autoComplete=""
                autoFocus
                value={query}
                onChange={handleChangeInputValue}
                ref={inputRef}
              />
            </div>

            {mode === 'searchOnGoogle' && <GoogleSuggestions />}
            {mode === 'searchOnYandex' && <YandexSuggestions />}
            {mode === 'searchOnNpm' && <NpmSuggestions />}
            {mode === 'searchInHistory' && <HistorySuggestions />}
            {mode === 'searchInBookmarks' && <BookmarkSuggestions />}
            {mode === 'searchInSessions' && <SessionSuggestions />}
            {mode === 'searchInLinks' && <LinkSuggestions />}
            {mode === 'commandPalette' && <CommandPaletteSuggestions />}
          </div>
        </HotkeysProvider>

        <CategoryGrid
          columnWidth={config?.columns?.width}
          columnGap={config?.columns?.gap}
          columnMaxCount={config?.columns?.maxCount}
          categories={config?.categories}
        />
      </div>
    </DashboardContext.Provider>
  );
};
