import { useMemo } from 'react';

import { useFetchNpmSuggestionsQuery } from '#api/mainApi';
import { Suggestion } from '#types/suggestionType';
import { getBundlePhobiaPackageUrl } from '#utils/getSearchEngineUrl';
import { openUrl } from '#utils/openUrl';

export const useNpmSuggestions = (query: string, isEnabled = true) => {
  const { data: suggestions } = useFetchNpmSuggestionsQuery(
    { query },
    { skip: !isEnabled || query.length === 0 },
  );

  const normalizedSuggestions = useMemo<Suggestion[]>(() => {
    if (query.trim().length === 0) {
      return [];
    }
    return (suggestions || []).map((suggestion) => ({
      title: suggestion.package.name,
      extra: suggestion.package.description,
      onClick: (e) => {
        const url = e?.altKey
          ? getBundlePhobiaPackageUrl(suggestion.package.name)
          : suggestion.package.links.npm;
        openUrl(url, e?.ctrlKey);
      },
    }));
  }, [query, suggestions]);

  return normalizedSuggestions;
};
