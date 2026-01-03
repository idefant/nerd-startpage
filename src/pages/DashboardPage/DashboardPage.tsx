import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';

import BookmarkSuggestions from '#components/BookmarkSuggestions';
import CommandPaletteSuggestions from '#components/CommandPaletteSuggestions/CommandPaletteSuggestions';
import GoogleSuggestions from '#components/GoogleSuggestions';
import HistorySuggestions from '#components/HistorySuggestions';
import LinkSuggestions from '#components/LinkSuggestions';
import NpmSuggestions from '#components/NpmSuggestions';
import SessionSuggestions from '#components/SessionSuggestions';
import YandexSuggestions from '#components/YandexSuggestions';
import { DashboardContext } from '#contexts/DashboardContext';
import { useAppSelector } from '#hooks/reduxHooks';
import { useCommandHotkey } from '#hooks/useCommandHotkey';
import { useDebounceState } from '#hooks/useDebounceState';
import { useEditConfig } from '#hooks/useEditConfig';
import { useModeHotkey } from '#hooks/useModeHotkey';
import { useModes } from '#hooks/useModes';
import { useReloadConfig } from '#hooks/useReloadConfig';
import { useSetConfigUrlFromClipboard } from '#hooks/useSetConfigUrlFromClipboard';
import { useShowConfig } from '#hooks/useShowConfig';
import { useShowIp } from '#hooks/useShowIp';
import { ModeName } from '#types/modeType';
import { CategoryGrid } from '#ui/CategoryGrid';
import { openGoogle } from '#utils/commands/openGoogle';
import { openLinkFromClipboard } from '#utils/commands/openLinkFromClipboard';
import { openYandex } from '#utils/commands/openYandex';
import { searchFromClipboard } from '#utils/commands/searchFromClipboard';

import cls from './DashboardPage.module.scss';

export const DashboardPage: FC = () => {
  const { config } = useAppSelector((state) => state.config);

  const [mode, setMode] = useState<ModeName>(config.defaultMode);
  const [query, debouncedQuery, setQuery, isPendingQuery] = useDebounceState('', 300);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { detailedModesMap } = useModes();

  const showConfig = useShowConfig();
  const editConfig = useEditConfig();
  const reloadConfig = useReloadConfig();
  const setConfigUrlFromClipboard = useSetConfigUrlFromClipboard();
  const showMyIP = useShowIp();

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  // === Mode Hotkeys ===
  useModeHotkey('google', () => setMode('google'));
  useModeHotkey('yandex', () => setMode('yandex'));
  useModeHotkey('npm', () => setMode('npm'));
  useModeHotkey('history', () => setMode('history'));
  useModeHotkey('bookmarks', () => setMode('bookmarks'));
  useModeHotkey('sessions', () => setMode('sessions'));
  useModeHotkey('links', () => setMode('links'));
  useModeHotkey('commandPalette', () => setMode('commandPalette'));

  // === Other Hotkeys ===
  useCommandHotkey('clearInput', () => setQuery('', true));
  useCommandHotkey('openLinkFromClipboard', (e) => openLinkFromClipboard({ newTab: e.ctrlKey }));
  useCommandHotkey('openGoogle', (e) => openGoogle({ newTab: e.ctrlKey }));
  useCommandHotkey('openYandex', (e) => openYandex({ newTab: e.ctrlKey }));
  useCommandHotkey('searchOnGoogleFromClipboard', (e) =>
    searchFromClipboard({ engine: 'google', newTab: e.ctrlKey }),
  );
  useCommandHotkey('searchOnYandexFromClipboard', (e) =>
    searchFromClipboard({ engine: 'yandex', newTab: e.ctrlKey }),
  );
  useCommandHotkey('showConfig', (e) => showConfig({ newTab: e.ctrlKey }));
  useCommandHotkey('editConfig', (e) => editConfig({ newTab: e.ctrlKey }));
  useCommandHotkey('reloadConfig', () => reloadConfig());
  useCommandHotkey('setConfigUrlFromClipboard', setConfigUrlFromClipboard);
  useCommandHotkey('showMyIP', showMyIP);

  const handleChangeInputValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const immediately = !e.target.value;
      setQuery(e.target.value, immediately);
    },
    [setQuery],
  );

  const dashboardContextValue = useMemo(
    () => ({ query, debouncedQuery, setQuery, isPendingQuery, setMode, searchBoxRef, inputRef }),
    [query, debouncedQuery, setQuery, isPendingQuery, setMode, searchBoxRef, inputRef],
  );

  return (
    <DashboardContext.Provider value={dashboardContextValue}>
      <div className={cls.container}>
        <HotkeysProvider initiallyActiveScopes={['suggestions']}>
          <div className={cls.search} ref={searchBoxRef}>
            <div className={cls.inputBox}>
              <div className={cls.inputIcon}>{detailedModesMap[mode].icon}</div>
              <input
                className={cls.inputField}
                autoComplete=""
                autoFocus
                value={query}
                onChange={handleChangeInputValue}
                ref={inputRef}
              />
            </div>

            {mode === 'google' && <GoogleSuggestions />}
            {mode === 'yandex' && <YandexSuggestions />}
            {mode === 'npm' && <NpmSuggestions />}
            {mode === 'history' && <HistorySuggestions />}
            {mode === 'bookmarks' && <BookmarkSuggestions />}
            {mode === 'sessions' && <SessionSuggestions />}
            {mode === 'links' && <LinkSuggestions />}
            {mode === 'commandPalette' && <CommandPaletteSuggestions />}
          </div>
        </HotkeysProvider>

        <CategoryGrid
          columnWidth={config.columns.width}
          columnGap={config.columns.gap}
          columnMaxCount={config.columns.maxCount}
          categories={config.categories}
        />
      </div>
    </DashboardContext.Provider>
  );
};
