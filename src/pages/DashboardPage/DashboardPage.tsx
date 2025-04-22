import classNames from 'classnames';
import mergeRefs from 'merge-refs';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-toastify';

import { useLazyFetchConfigQuery, useLazyFetchMyIpQuery } from '#api/mainApi';
import { useAppDispatch, useAppSelector } from '#hooks/reduxHooks';
import { useBookmarkSuggestions } from '#hooks/useBookmarkSuggestions';
import { useDebounceState } from '#hooks/useDebounceState';
import { useGoogleSuggestions } from '#hooks/useGoogleSuggestions';
import { useHistorySuggestions } from '#hooks/useHistorySuggestions';
import { useLinkSuggestions } from '#hooks/useLinkSuggestions';
import { useNpmSuggestions } from '#hooks/useNpmSuggestions';
import { useSessionSuggestions } from '#hooks/useSessionSuggestions';
import { useYandexSuggestions } from '#hooks/useYandexSuggestions';
import { hotkeysCommandList } from '#schema/configSchema';
import { setConfigUrl } from '#store/reducers/configSlice';
import { FilterWithIsMode, ToTuple } from '#types/basicType';
import { modeList } from '#types/modeType';
import { Suggestion, SuggestionActionEvent } from '#types/suggestionType';
import { CategoryGrid } from '#ui/CategoryGrid';
import { checkIsValidUrl } from '#utils/checkIsValidUrl';
import { getGoogleSearchUrl, getNpmSearchUrl, getYandexSearchUrl } from '#utils/getSearchEngineUrl';
import { getTextFromClipboard } from '#utils/getTextFromClipboard';
import { loopBetween } from '#utils/loopBetween';
import { openUrl } from '#utils/openUrl';

import cls from './DashboardPage.module.scss';

const commandKeys = [
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

type CommandKey = (typeof commandKeys)[number];

/* eslint-disable no-unused-vars */
type Command = {
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
          onAction: (e?: SuggestionActionEvent) => void;
          other?: undefined;
        }
      | {
          url?: undefined;
          onAction?: undefined;
          other: boolean;
        }
    ))
);
/* eslint-enable no-unused-vars */

const commandsMap = {
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

type Mode = keyof FilterWithIsMode<typeof commandsMap>;

type Commands = ToTuple<typeof commandKeys, typeof commandsMap>;

const commands = commandKeys.map((commandKey) => ({
  key: commandKey,
  ...commandsMap[commandKey],
})) as any as Commands;

export const DashboardPage: FC = () => {
  const [mode, setMode] = useState<Mode>('searchOnGoogle');
  const [query, debouncedQuery, setQuery] = useDebounceState('', 300);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [hasBackdrop, setHasBackdrop] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { configUrl, config } = useAppSelector((state) => state.config);

  const [reloadConfig] = useLazyFetchConfigQuery();
  const [fetchIP] = useLazyFetchMyIpQuery();

  const googleSuggestions = useGoogleSuggestions(debouncedQuery, mode === 'searchOnGoogle');
  const yandexSuggestions = useYandexSuggestions(debouncedQuery, mode === 'searchOnYandex');
  const npmSuggestions = useNpmSuggestions(debouncedQuery, mode === 'searchOnNpm');
  const historySuggestions = useHistorySuggestions(query, mode === 'searchInHistory');
  const bookmarkSuggestions = useBookmarkSuggestions(query, mode === 'searchInBookmarks');
  const sessionSuggestions = useSessionSuggestions(query, mode === 'searchInSessions');
  const linkSuggestions = useLinkSuggestions(query, mode === 'searchInLinks');

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  const scrollSuggestionsToTop = useCallback(
    () => suggestionsRef.current?.scrollTo({ top: 0 }),
    [],
  );

  const scrollToActiveSuggestion = useCallback(() => {
    const activeElem = suggestionsRef.current?.children[activeSuggestionIndex];
    activeElem?.scrollIntoView({ block: 'nearest' });
  }, [activeSuggestionIndex]);

  const handleShowConfig = useCallback(
    (e?: SuggestionActionEvent) => {
      if (!configUrl) {
        toast.error('Config URL is empty');
        return;
      }
      openUrl(configUrl, e?.ctrlKey);
    },
    [configUrl],
  );

  const handleEditConfig = useCallback(
    (e?: SuggestionActionEvent) => {
      if (config?.editConfigUrl) {
        openUrl(config.editConfigUrl, e?.ctrlKey);
        return;
      }
      handleShowConfig(e);
    },
    [config?.editConfigUrl, handleShowConfig],
  );

  const handleReloadConfig = useCallback(() => {
    if (!configUrl) {
      toast.error('Config URL is empty');
      return;
    }
    reloadConfig({ configUrl });
  }, [configUrl, reloadConfig]);

  const handleSetConfigUrlFromClipboard = useCallback(async () => {
    const url = await getTextFromClipboard();
    if (!url) return;
    const urlValidationResult = checkIsValidUrl(url, true);
    if (!urlValidationResult.success) {
      toast.error('Config URL from clipboard is invalid');
      return;
    }
    toast.success('Config URL was successfully added');
    dispatch(setConfigUrl(urlValidationResult.url));
  }, [dispatch]);

  const handleShowIP = useCallback(async () => {
    const res = await fetchIP(undefined);
    if (res.error) {
      toast.error('Не удалось получить IP адрес');
      return;
    }
    toast.success(
      <div>
        <div>
          <b>IP:</b> {res.data?.ip}
        </div>
        <div>
          <b>Country:</b> {res.data?.country}
        </div>
      </div>,
    );
  }, [fetchIP]);

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

          return {
            title: command.title,
            extra,
            onClick: (e) => {
              if ('isMode' in command && command.isMode) {
                setQuery('', true);
                setMode(command.key);
                return;
              }
              if ('url' in command && command.url) {
                openUrl(command.url, e?.ctrlKey);
                return;
              }
              if ('onAction' in command) {
                command.onAction();
                return;
              }
              if ('other' in command && !('hideInCommandPalette' in command)) {
                ({
                  showConfig: () => handleShowConfig(e),
                  editConfig: () => handleEditConfig(e),
                  reloadConfig: handleReloadConfig,
                  setConfigUrlFromClipboard: handleSetConfigUrlFromClipboard,
                  showMyIP: handleShowIP,
                })[command.key]();
              }
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
    ],
  );

  const suggestions = useMemo(() => {
    const modeMap = {
      searchOnGoogle: googleSuggestions,
      searchOnYandex: yandexSuggestions,
      searchOnNpm: npmSuggestions,
      searchInHistory: historySuggestions,
      searchInBookmarks: bookmarkSuggestions,
      searchInSessions: sessionSuggestions,
      searchInLinks: linkSuggestions,
      commandPalette: commandPaletteSuggestions,
    };
    return modeMap[mode];
  }, [
    bookmarkSuggestions,
    commandPaletteSuggestions,
    googleSuggestions,
    historySuggestions,
    linkSuggestions,
    mode,
    npmSuggestions,
    sessionSuggestions,
    yandexSuggestions,
  ]);

  const handleShowBackdropIfNeed = useCallback(() => {
    setHasBackdrop(!!query || !!suggestions.length);
  }, [query, suggestions?.length]);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
    scrollSuggestionsToTop();
  }, [scrollSuggestionsToTop, suggestions]);

  useEffect(() => {
    if (activeSuggestionIndex === -1) {
      scrollSuggestionsToTop();
      return;
    }
    scrollToActiveSuggestion();
  }, [activeSuggestionIndex, scrollSuggestionsToTop, scrollToActiveSuggestion]);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
    focusInput();
  }, [focusInput, mode]);

  useEffect(() => handleShowBackdropIfNeed(), [handleShowBackdropIfNeed]);

  // === Navigation Hotkeys ===
  const prevSuggestionRef = useHotkeys<HTMLInputElement>(
    hotkeys.prevSuggestion,
    () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev - 1)),
    { enableOnFormTags: ['input'], preventDefault: true },
  );
  const nextSuggestionRef = useHotkeys<HTMLInputElement>(
    hotkeys.nextSuggestion,
    () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev + 1)),
    { enableOnFormTags: ['input'], preventDefault: true },
  );
  const enterRef = useHotkeys<HTMLInputElement>(
    'Enter, Ctrl+Enter, Alt+Enter, Alt+Ctrl+Enter',
    (e) => {
      if (activeSuggestionIndex !== -1) {
        const suggestion = suggestions[activeSuggestionIndex];
        suggestion.onClick?.(e);
        return;
      }
      if (!query) return;

      if (mode === 'searchOnGoogle') {
        const urlValidationResult = checkIsValidUrl(query);
        if (urlValidationResult.success) {
          openUrl(urlValidationResult.url, e.ctrlKey);
          return;
        }
        const url = getGoogleSearchUrl(query);
        openUrl(url, e.ctrlKey);
        return;
      }
      if (mode === 'searchOnYandex') {
        const urlValidationResult = checkIsValidUrl(query);
        if (urlValidationResult.success) {
          openUrl(urlValidationResult.url, e.ctrlKey);
          return;
        }
        const url = getYandexSearchUrl(query);
        openUrl(url, e.ctrlKey);
        return;
      }
      if (mode === 'searchOnNpm') {
        const url = getNpmSearchUrl(query);
        openUrl(url, e.ctrlKey);
        return;
      }
      if (mode === 'searchInLinks') {
        const links = (config?.categories || []).flatMap((category) => category.links);
        const foundLink = links.find((link) => link.alias === query.trim());
        if (!foundLink) return;
        openUrl(foundLink.url, e.ctrlKey);
        return;
      }
    },
    { enableOnFormTags: ['input'], preventDefault: true },
  );
  const continueFromRef = useHotkeys<HTMLInputElement>(
    'Tab',
    () => {
      if (!(mode === 'searchOnGoogle' || mode === 'searchOnYandex') || activeSuggestionIndex === -1)
        return;
      const suggestion = suggestions[activeSuggestionIndex];
      if (!suggestion.title) return;
      setQuery(`${suggestion.title} `);
    },
    { enableOnFormTags: ['input'], preventDefault: true },
  );
  useHotkeys(
    'Esc',
    () => {
      focusInput();
      if (hasBackdrop) {
        setHasBackdrop(false);
      } else {
        handleShowBackdropIfNeed();
      }
    },
    { enableOnFormTags: ['input'], preventDefault: true },
  );

  // === Mode Hotkeys ===
  useHotkeys(hotkeys.searchOnGoogle, () => setMode('searchOnGoogle'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.searchOnYandex, () => setMode('searchOnYandex'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.searchOnNpm, () => setMode('searchOnNpm'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.searchInHistory, () => setMode('searchInHistory'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.searchInBookmarks, () => setMode('searchInBookmarks'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.searchInSessions, () => setMode('searchInSessions'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.searchInLinks, () => setMode('searchInLinks'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.commandPalette, () => setMode('commandPalette'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });

  // === Other Hotkeys ===
  useHotkeys(hotkeys.clearInput, () => setQuery('', true), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.openLinkFromClipboard, commandsMap.openLinkFromClipboard.onAction, {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.openGoogle, (e) => openUrl(commandsMap.openGoogle.url, e?.ctrlKey), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.openYandex, (e) => openUrl(commandsMap.openYandex.url, e?.ctrlKey), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(
    hotkeys.searchOnGoogleFromClipboard,
    commandsMap.searchOnGoogleFromClipboard.onAction,
    { enableOnFormTags: ['input'], preventDefault: true },
  );
  useHotkeys(
    hotkeys.searchOnYandexFromClipboard,
    commandsMap.searchOnYandexFromClipboard.onAction,
    { enableOnFormTags: ['input'], preventDefault: true },
  );
  useHotkeys(hotkeys.showConfig, handleShowConfig, {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.editConfig, handleEditConfig, {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.reloadConfig, handleReloadConfig, {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.setConfigUrlFromClipboard, handleSetConfigUrlFromClipboard, {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(hotkeys.showMyIP, handleShowIP, {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });

  const handleChangeInputValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const immediately = !e.target.value;
      setQuery(e.target.value, immediately);
    },
    [setQuery],
  );

  return (
    <div className={cls.container}>
      <div className={cls.search}>
        <div className={cls.inputBox}>
          <div className={cls.inputIcon}>{commandsMap[mode].icon}</div>
          <input
            className={cls.inputField}
            autoComplete=""
            autoFocus
            value={query}
            onChange={handleChangeInputValue}
            onClick={handleShowBackdropIfNeed}
            ref={mergeRefs(
              inputRef,
              prevSuggestionRef,
              nextSuggestionRef,
              enterRef,
              continueFromRef,
            )}
          />
        </div>
        <div
          className={classNames(cls.inputSuggestions, {
            [cls.inputSuggestionsVisible]: hasBackdrop && suggestions.length !== 0,
          })}
          ref={suggestionsRef}
        >
          {suggestions?.map((suggestion, i) => (
            <button
              className={classNames(cls.suggestion, {
                [cls.suggestionActive]: activeSuggestionIndex === i,
              })}
              onClick={suggestion.onClick}
              type="button"
            >
              <span className={cls.suggestionTitle}>{suggestion.title || '--- no_title ---'}</span>
              {suggestion.extra && <span className={cls.suggestionExtra}>{suggestion.extra}</span>}
            </button>
          ))}
        </div>
      </div>

      <CategoryGrid
        columnWidth={config?.columns?.width}
        columnGap={config?.columns?.gap}
        columnMaxCount={config?.columns?.maxCount}
        categories={config?.categories}
      />

      <div
        className={classNames(cls.backdrop, { [cls.backdropVisible]: hasBackdrop })}
        onClick={() => setHasBackdrop(false)}
      />
    </div>
  );
};
