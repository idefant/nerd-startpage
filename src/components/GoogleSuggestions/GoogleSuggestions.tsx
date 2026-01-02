import { FC, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { useFetchGoogleSuggestionsQuery } from '#api/mainApi';
import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { useDashboardContext } from '#contexts/DashboardContext';
import { Suggestion } from '#types/suggestionType';
import SuggestionList, { SuggestionListRef } from '#ui/SuggestionList';
import { checkIsValidUrl } from '#utils/checkIsValidUrl';
import { getGoogleSearchUrl } from '#utils/getSearchEngineUrl';
import { openUrl } from '#utils/openUrl';

const GoogleSuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.debouncedQuery);
  const setQuery = useDashboardContext((ctx) => ctx.setQuery);

  const suggestionListRef = useRef<SuggestionListRef>(null);

  const { data: googleSuggestions } = useFetchGoogleSuggestionsQuery(
    { query },
    { skip: query.length === 0 },
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    if (query.trim().length === 0) {
      return [];
    }
    return (googleSuggestions?.[1] || []).map((suggestion) => {
      const openSuggestion = (options?: { newTab?: boolean }) => {
        const urlValidationResult = checkIsValidUrl(suggestion);
        if (urlValidationResult.success) {
          openUrl(urlValidationResult.url, options?.newTab);
          return;
        }
        openUrl(getGoogleSearchUrl(suggestion), options?.newTab);
      };

      return {
        title: suggestion,
        actions: {
          '': () => openSuggestion(),
          c: () => openSuggestion({ newTab: true }),
        },
      };
    }) as Suggestion[];
  }, [googleSuggestions, query]);

  useHotkeys(
    'Enter',
    (e) => {
      const suggestion = suggestionListRef.current?.currentSuggestion;
      if (suggestion || !query) return;

      const urlValidationResult = checkIsValidUrl(query);
      if (urlValidationResult.success) {
        openUrl(urlValidationResult.url, e.ctrlKey);
        return;
      }
      const url = getGoogleSearchUrl(query);
      openUrl(url, e.ctrlKey);
    },
    { ...hotkeyHookConfig, scopes: 'suggestions', ignoreModifiers: true },
  );

  useHotkeys(
    'Tab',
    () => {
      const suggestion = suggestionListRef.current?.currentSuggestion;
      if (!suggestion || !suggestion.title) return;
      setQuery(`${suggestion.title} `);
    },
    { ...hotkeyHookConfig, scopes: 'suggestions' },
  );

  return <SuggestionList suggestions={suggestions} ref={suggestionListRef} />;
};

export default GoogleSuggestions;
