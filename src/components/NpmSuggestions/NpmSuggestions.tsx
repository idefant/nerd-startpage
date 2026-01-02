import { FC, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { useFetchNpmSuggestionsQuery } from '#api/mainApi';
import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { useDashboardContext } from '#contexts/DashboardContext';
import { Suggestion } from '#types/suggestionType';
import SuggestionList, { SuggestionListRef } from '#ui/SuggestionList';
import { getBundlePhobiaPackageUrl, getNpmSearchUrl } from '#utils/getSearchEngineUrl';
import { openUrl } from '#utils/openUrl';

const NpmSuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.debouncedQuery);

  const suggestionListRef = useRef<SuggestionListRef>(null);

  const { data: npmSuggestions } = useFetchNpmSuggestionsQuery(
    { query },
    { skip: query.length === 0 },
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    if (query.trim().length === 0) {
      return [];
    }
    return (npmSuggestions || []).map((suggestion) => {
      const openSuggestion = (options?: { newTab?: boolean; bundlePhobia?: boolean }) => {
        const url = options?.bundlePhobia
          ? getBundlePhobiaPackageUrl(suggestion.package.name)
          : suggestion.package.links.npm;
        openUrl(url, options?.newTab);
      };

      return {
        title: suggestion.package.name,
        extra: suggestion.package.description,
        actions: {
          '': () => openSuggestion(),
          c: () => openSuggestion({ newTab: true }),
          a: () => openSuggestion({ bundlePhobia: true }),
          ca: () => openSuggestion({ bundlePhobia: true, newTab: true }),
        },
      };
    });
  }, [query, npmSuggestions]);

  useHotkeys(
    'Enter',
    (e) => {
      const suggestion = suggestionListRef.current?.currentSuggestion;
      if (suggestion || !query) return;

      const url = getNpmSearchUrl(query);
      openUrl(url, e.ctrlKey);
    },
    { ...hotkeyHookConfig, scopes: 'suggestions', ignoreModifiers: true },
  );

  return <SuggestionList suggestions={suggestions} ref={suggestionListRef} />;
};

export default NpmSuggestions;
