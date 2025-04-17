import classNames from 'classnames';
import mergeRefs from 'merge-refs';
import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-toastify';

import { useLazyFetchConfigQuery } from '#api/mainApi';
import { useAppDispatch, useAppSelector } from '#hooks/reduxHooks';
import { useBookmarkSuggestions } from '#hooks/useBookmarkSuggestions';
import { useDebounceState } from '#hooks/useDebounceState';
import { useGoogleSuggestions } from '#hooks/useGoogleSuggestions';
import { useHistorySuggestions } from '#hooks/useHistorySuggestions';
import { useSessionSuggestions } from '#hooks/useSessionSuggestions';
import { useYandexSuggestions } from '#hooks/useYandexSuggestions';
import { hotkeysCommandList } from '#schema/configSchema';
import { setConfigUrl } from '#store/reducers/configSlice';
import { FilterWithIsMode, ToTuple } from '#types/basicType';
import { modeList } from '#types/modeType';
import { Suggestion, SuggestionActionEvent } from '#types/suggestionType';
import { CategoryCard } from '#ui/CategoryCard';
import { checkIsValidUrl } from '#utils/checkIsValidUrl';
import { getGoogleSearchUrl, getYandexSearchUrl } from '#utils/getSearchEngineUrl';
import { getTextFromClipboard } from '#utils/getTextFromClipboard';
import { loopBetween } from '#utils/loopBetween';
import { maxBy } from '#utils/maxBy';
import { minBy } from '#utils/minBy';
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
] as const;

type CommandKey = (typeof commandKeys)[number];

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

const commandsMap = {
  searchOnGoogle: { title: 'Search on Google', hotkey: 'ctrl+g', isMode: true, icon: '' },
  searchOnYandex: { title: 'Search on Yandex', hotkey: 'ctrl+y', isMode: true, icon: '' },
  searchInHistory: { title: 'Search in History', hotkey: 'ctrl+h', isMode: true, icon: '' },
  searchInBookmarks: { title: 'Search in Bookmarks', hotkey: 'ctrl+b', isMode: true, icon: '' },
  searchInSessions: { title: 'Search in Sessions', hotkey: 'ctrl+s', isMode: true, icon: '󰭌' },
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
      if (!checkIsValidUrl(url)) {
        toast.error('URL from clipboard is invalid');
        return;
      }
      openUrl(url);
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

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { configUrl, config } = useAppSelector((state) => state.config);

  const [reloadConfig] = useLazyFetchConfigQuery();

  const googleSuggestions = useGoogleSuggestions(debouncedQuery, mode === 'searchOnGoogle');
  const yandexSuggestions = useYandexSuggestions(debouncedQuery, mode === 'searchOnYandex');
  const historySuggestions = useHistorySuggestions(debouncedQuery, mode === 'searchInHistory');
  const bookmarkSuggestions = useBookmarkSuggestions(debouncedQuery, mode === 'searchInBookmarks');
  const sessionSuggestions = useSessionSuggestions(mode === 'searchInSessions');

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
    if (!checkIsValidUrl(url)) {
      toast.error('Config URL from clipboard is invalid');
      return;
    }
    toast.success('Config URL was successfully added');
    dispatch(setConfigUrl(url));
  }, [dispatch]);

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
      hotkeys,
      query,
      setQuery,
    ],
  );

  const suggestions = useMemo(() => {
    const modeMap = {
      searchOnGoogle: googleSuggestions,
      searchOnYandex: yandexSuggestions,
      searchInHistory: historySuggestions,
      searchInBookmarks: bookmarkSuggestions,
      searchInSessions: sessionSuggestions,
      commandPalette: commandPaletteSuggestions,
    };
    return modeMap[mode];
  }, [
    bookmarkSuggestions,
    commandPaletteSuggestions,
    googleSuggestions,
    historySuggestions,
    mode,
    sessionSuggestions,
    yandexSuggestions,
  ]);

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

  // === Navigation Hotkeys ===
  const upRef = useHotkeys<HTMLDivElement>(
    hotkeys.prevSuggestion,
    () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev - 1)),
    { enableOnFormTags: ['input'], preventDefault: true },
  );
  const downRef = useHotkeys<HTMLDivElement>(
    hotkeys.nextSuggestion,
    () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev + 1)),
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
  useHotkeys(hotkeys.commandPalette, () => setMode('commandPalette'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });

  // === Other Hotkeys ===
  useHotkeys(hotkeys.clearInput, () => setQuery(''), {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const categoryListRef = useRef<(HTMLDivElement | null)[]>([]);

  type CardCoord = { index: number; width: number; height: number; top: number; left: number };

  const [categoriesListSize, setCategoriesListSize] = useState<{ width: number; height: number }>();
  const [categoriesCoords, setCategoriesCoords] = useState<CardCoord[]>([]);

  const roCallback = useCallback(() => {
    if (!config || !config?.categories || !containerRef.current) return;

    const elems = categoryListRef.current.filter((elem): elem is HTMLDivElement => !!elem);

    const elemsSizes = elems.map((elem, i) => ({
      index: i,
      width: elem.offsetWidth,
      height: elem.offsetHeight,
    }));

    const columnWidth = config.columns?.width || 200;
    const columnGap = config.columns?.gap || 20;
    const columnMaxCount = config.columns?.maxCount || 6;

    const containerWidth = containerRef.current.offsetWidth;

    const columnPotentialCount = Math.floor(
      (containerWidth + columnGap) / (columnWidth + columnGap),
    );

    const columnsCount = Math.min(columnPotentialCount, columnMaxCount) || 1;

    const categoriesListWidth = columnsCount * (columnWidth + columnGap) - columnGap;

    const elemsLocations = elemsSizes.reduce(
      (acc, elem) => {
        const [minColumn] = minBy(acc, (column) => column.height);
        if (!minColumn) return acc;

        acc[minColumn.index].elems.push({
          ...elem,
          top: acc[minColumn.index].height,
          left: minColumn.index * (columnWidth + columnGap),
        });
        acc[minColumn.index].height += elem.height + columnGap;

        return acc;
      },
      [...Array(columnsCount)].map((_, i) => ({
        index: i,
        height: 0,
        elems: [] as CardCoord[],
      })),
    );
    const [maxColumn] = maxBy(elemsLocations, (category) => category.height);

    setCategoriesListSize({ width: categoriesListWidth, height: maxColumn?.height || 0 });

    const coords = elemsLocations.flatMap((elem) => elem.elems).sort((a, b) => a.index - b.index);

    setCategoriesCoords(coords);
  }, [config]);

  const ro = useMemo(() => new ResizeObserver(roCallback), [roCallback]);

  useLayoutEffect(() => {
    const elems = categoryListRef.current.filter((elem): elem is HTMLDivElement => !!elem);
    elems.forEach((elem) => ro.observe(elem));

    return () => ro.disconnect();
  }, [ro]);

  useLayoutEffect(() => {
    window.addEventListener('resize', roCallback);
    return () => window.removeEventListener('resize', roCallback);
  }, [roCallback]);

  return (
    <div className={cls.container} ref={containerRef}>
      <div className={cls.search} ref={mergeRefs(upRef, downRef)}>
        <div className={cls.inputBox}>
          <div className={cls.inputIcon}>{commandsMap[mode].icon}</div>
          <input
            className={cls.inputField}
            autoComplete=""
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={async (e) => {
              if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.code)) {
                e.preventDefault();
              }
              if (e.code === 'Enter') {
                if (activeSuggestionIndex === -1) {
                  if (mode === 'searchOnGoogle') {
                    const url = getGoogleSearchUrl(query);
                    openUrl(url, e.ctrlKey);
                    return;
                  }
                  if (mode === 'searchOnYandex') {
                    const url = getYandexSearchUrl(query);
                    openUrl(url, e.ctrlKey);
                    return;
                  }
                } else {
                  const suggestion = suggestions[activeSuggestionIndex];
                  suggestion.onClick?.(e);
                }
              }
            }}
            ref={inputRef}
          />
        </div>
        <div
          className={classNames(cls.inputSuggestions, {
            [cls.inputSuggestionsHidden]: suggestions.length === 0,
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

      <div
        className={classNames(cls.categories, {
          [cls.categoriesHidden]: categoriesCoords.length === 0,
        })}
        style={{ width: categoriesListSize?.width, height: categoriesListSize?.height }}
      >
        {config?.categories?.map((category, i) => (
          <CategoryCard
            name={category.name}
            links={category.links}
            style={{
              width: config.columns?.width,
              top: categoriesCoords[i]?.top,
              left: categoriesCoords[i]?.left,
            }}
            className={cls.categoryCard}
            ref={(elem) => {
              categoryListRef.current[i] = elem;
            }}
            key={i}
          />
        ))}
      </div>
    </div>
  );
};
