import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { toast } from 'react-toastify';

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
import { CommandName } from '#types/commandType';
import { ModeName } from '#types/modeType';
import { CategoryGrid } from '#ui/CategoryGrid';
import { checkIsValidUrl } from '#utils/checkIsValidUrl';
import { getGoogleSearchUrl, getYandexSearchUrl } from '#utils/getSearchEngineUrl';
import { getTextFromClipboard } from '#utils/getTextFromClipboard';
import { ModifiersOnlyEvent } from '#utils/modifiers';
import { openUrl } from '#utils/openUrl';

import cls from './DashboardPage.module.scss';

export const DashboardPage: FC = () => {
  const { config } = useAppSelector((state) => state.config);

  const [mode, setMode] = useState<ModeName>(config.defaultMode);
  const [query, debouncedQuery, setQuery] = useDebounceState('', 300);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { detailedModesMap } = useModes();

  const handleShowConfig = useShowConfig();
  const handleEditConfig = useEditConfig();
  const handleReloadConfig = useReloadConfig();
  const handleSetConfigUrlFromClipboard = useSetConfigUrlFromClipboard();
  const handleShowIP = useShowIp();

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

  const commandActionsMap: Record<
    Exclude<CommandName, 'nextSuggestion' | 'prevSuggestion'>,
    (e: Partial<ModifiersOnlyEvent>) => void
  > = useMemo(
    () => ({
      clearInput: () => setQuery('', true),
      openLinkFromClipboard: async () => {
        const url = await getTextFromClipboard();
        if (!url) return;
        const urlValidationResult = checkIsValidUrl(url);
        if (!urlValidationResult.success) {
          toast.error('URL from clipboard is invalid');
          return;
        }
        openUrl(urlValidationResult.url);
      },
      openGoogle: (e) => openUrl('https://google.com', e?.ctrlKey),
      openYandex: (e) => openUrl('https://ya.ru', e?.ctrlKey),
      searchOnGoogleFromClipboard: async () => {
        const query = await getTextFromClipboard();
        if (!query) return;
        openUrl(getGoogleSearchUrl(query));
      },
      searchOnYandexFromClipboard: async () => {
        const query = await getTextFromClipboard();
        if (!query) return;
        openUrl(getYandexSearchUrl(query));
      },
      showConfig: () => handleShowConfig(),
      editConfig: () => handleEditConfig(),
      reloadConfig: () => handleReloadConfig(),
      setConfigUrlFromClipboard: handleSetConfigUrlFromClipboard,
      showMyIP: handleShowIP,
    }),
    [
      handleEditConfig,
      handleReloadConfig,
      handleSetConfigUrlFromClipboard,
      handleShowConfig,
      handleShowIP,
      setQuery,
    ],
  );

  // === Other Hotkeys ===
  useCommandHotkey('clearInput', commandActionsMap.clearInput);
  useCommandHotkey('openLinkFromClipboard', commandActionsMap.openLinkFromClipboard);
  useCommandHotkey('openGoogle', commandActionsMap.openGoogle);
  useCommandHotkey('openYandex', commandActionsMap.openYandex);
  useCommandHotkey('searchOnGoogleFromClipboard', commandActionsMap.searchOnGoogleFromClipboard);
  useCommandHotkey('searchOnYandexFromClipboard', commandActionsMap.searchOnYandexFromClipboard);
  useCommandHotkey('showConfig', commandActionsMap.showConfig);
  useCommandHotkey('editConfig', commandActionsMap.editConfig);
  useCommandHotkey('reloadConfig', commandActionsMap.reloadConfig);
  useCommandHotkey('setConfigUrlFromClipboard', commandActionsMap.setConfigUrlFromClipboard);
  useCommandHotkey('showMyIP', commandActionsMap.showMyIP);

  const handleChangeInputValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const immediately = !e.target.value;
      setQuery(e.target.value, immediately);
    },
    [setQuery],
  );

  const dashboardContextValue = useMemo(
    () => ({ query, debouncedQuery, setQuery, setMode, searchBoxRef, inputRef }),
    [query, debouncedQuery, setQuery, setMode, searchBoxRef, inputRef],
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
            {mode === 'commandPalette' && (
              <CommandPaletteSuggestions commandActionsMap={commandActionsMap} />
            )}
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
