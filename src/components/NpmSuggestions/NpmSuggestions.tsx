import { FC, useCallback, useMemo } from 'react';

import { useFetchNpmSuggestionsQuery } from '#api/mainApi';
import { useDashboardContext } from '#contexts/DashboardContext';
import { Suggestion } from '#types/suggestionType';
import SuggestionList from '#ui/SuggestionList';
import { getBundlePhobiaPackageUrl, getNpmSearchUrl } from '#utils/getSearchEngineUrl';
import { ModifiersOnlyEvent } from '#utils/modifiers';
import { openUrl } from '#utils/openUrl';

const NpmSuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.debouncedQuery);

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

  const handleEnterQuery = useCallback(
    (e: ModifiersOnlyEvent) => {
      if (!query) return;
      const url = getNpmSearchUrl(query);
      openUrl(url, e.ctrlKey);
    },
    [query],
  );

  return <SuggestionList suggestions={suggestions} onEnterWithoutSuggestion={handleEnterQuery} />;
};

export default NpmSuggestions;
