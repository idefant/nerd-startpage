import classNames from 'classnames';
import mergeRefs from 'merge-refs';
import mitt from 'mitt';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { setConfigUrl } from '#store/reducers/configSlice';
import { Suggestion } from '#types/suggestionType';
import { checkIsValidUrl } from '#utils/checkIsValidUrl';
import { getGoogleSearchUrl, getYandexSearchUrl } from '#utils/getSearchEngineUrl';
import { getTextFromClipboard } from '#utils/getTextFromClipboard';
import { loopBetween } from '#utils/loopBetween';
import { openUrl } from '#utils/openUrl';

import cls from './DashboardPage.module.scss';

const commandKeys = [
  'searchOnGoogle',
  'searchOnYandex',
  'searchInHistory',
  'searchInBookmarks',
  'searchInSessions',
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
  'commandPalette',
] as const;

type CommandKey = (typeof commandKeys)[number];

const emitter = mitt<Record<CommandKey, undefined>>();

type Command2 = {
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
          onAction: (
            e?:
              | React.KeyboardEvent<HTMLInputElement>
              | React.MouseEvent<HTMLButtonElement, MouseEvent>,
          ) => void;
          other?: undefined;
        }
      | {
          url?: undefined;
          onAction?: undefined;
          other: boolean;
        }
    ))
);

// XXX: Перенести во внутрь компонента
//      или использовать PubSub
//      или может вообще не писать onAction и сделать как в ClearInput
const commandsMap = {
  searchOnGoogle: { title: 'Search on Google', hotkey: 'ctrl+f', isMode: true, icon: '' },
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
  editConfig: { title: 'Edit config', url: 'https://your-config-url.com' },
  showConfig: { title: 'Show config', url: 'https://your-config-url.com' },
  reloadConfig: {
    title: 'Reload config',
    other: true,
  },
  setConfigUrlFromClipboard: {
    title: 'Set config url from clipboard',
    other: true,
  },
} satisfies Record<CommandKey, Command2>;

type FilterWithIsMode<T> = {
  [K in keyof T as T[K] extends { isMode: any } ? K : never]: T[K];
};

type Mode = keyof FilterWithIsMode<typeof commandsMap>;

type ToTuple<K extends readonly string[], T> = {
  [I in keyof K]: K[I] extends keyof T ? { key: K[I] } & T[K[I]] : never;
};

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
  const { configUrl } = useAppSelector((state) => state.config);

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

  const commandPaletteSuggestions: Suggestion[] = useMemo(
    () =>
      commands
        .filter((command) => !('hideInCommandPalette' in command && command.hideInCommandPalette))
        .filter((command) =>
          query ? command.title.toLowerCase().includes(query.toLowerCase()) : true,
        )
        .map((command) => ({
          title: command.title,
          extra: 'hotkey' in command ? command.hotkey : undefined,
          onClick: async (e) => {
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
            if ('other' in command) {
              if (command.key === 'clearInput') {
                setQuery('');
                focusInput();
              } else if (command.key === 'reloadConfig') {
                if (!configUrl) {
                  toast.error('Config URL is empty');
                  return;
                }
                reloadConfig({ configUrl });
              } else if (command.key === 'setConfigUrlFromClipboard') {
                const url = await getTextFromClipboard();
                if (!url) return;
                if (!checkIsValidUrl(url)) {
                  toast.error('Config URL from clipboard is invalid');
                  return;
                }
                toast.success('Config URL was successfully added');
                dispatch(setConfigUrl(url));
              }
            }
          },
        })),
    [configUrl, dispatch, focusInput, query, reloadConfig, setQuery],
  );

  const suggestions = useMemo(() => {
    if (mode === 'searchOnGoogle') {
      return googleSuggestions;
    }
    if (mode === 'searchOnYandex') {
      return yandexSuggestions;
    }
    if (mode === 'searchInHistory') {
      return historySuggestions;
    }
    if (mode === 'searchInBookmarks') {
      return bookmarkSuggestions;
    }
    if (mode === 'searchInSessions') {
      return sessionSuggestions;
    }
    if (mode === 'commandPalette') {
      return commandPaletteSuggestions;
    }
    return [];
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

  const upRef = useHotkeys<HTMLDivElement>(
    'ArrowUp',
    () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev - 1)),
    { enableOnFormTags: ['input'] },
  );
  const downRef = useHotkeys<HTMLDivElement>(
    'ArrowDown',
    () => setActiveSuggestionIndex((prev) => loopBetween(-1, suggestions.length - 1, prev + 1)),
    { enableOnFormTags: ['input'] },
  );

  useHotkeys('ctrl+g', () => setMode('searchOnGoogle'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys('ctrl+y', () => setMode('searchOnYandex'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys('ctrl+h', () => setMode('searchInHistory'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys('ctrl+b', () => setMode('searchInBookmarks'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys('ctrl+s', () => setMode('searchInSessions'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys('ctrl+p', () => setMode('commandPalette'), {
    enableOnFormTags: ['input'],
    preventDefault: true,
  });
  useHotkeys(
    'ctrl+l',
    () => {
      setQuery('');
      focusInput();
    },
    { enableOnFormTags: ['input'], preventDefault: true },
  );

  return (
    <div className={cls.container}>
      <div>{activeSuggestionIndex}</div>

      <div>{query}</div>
      <div>{debouncedQuery}</div>

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
    </div>
  );
};
