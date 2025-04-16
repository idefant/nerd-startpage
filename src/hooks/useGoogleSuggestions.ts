import { useMemo } from 'react';

import { useFetchGoogleSuggestionsQuery } from '#api/mainApi';
import { Suggestion } from '#types/suggestionType';
import { getGoogleSearchUrl } from '#utils/getSearchEngineUrl';
import { openUrl } from '#utils/openUrl';

export const useGoogleSuggestions = (query: string, isEnabled = true) => {
  const { data: suggestions } = useFetchGoogleSuggestionsQuery(
    { query },
    { skip: !isEnabled || query.length === 0 },
  );

  const normalizedSuggestions = useMemo<Suggestion[]>(() => {
    if (query.trim().length === 0) {
      return [];
    }
    return (suggestions?.[1] || []).map((suggestion) => ({
      title: suggestion,
      onClick: (e) => {
        openUrl(getGoogleSearchUrl(suggestion), e?.ctrlKey);
      },
    })) as Suggestion[];
  }, [suggestions, query]);

  return normalizedSuggestions;
};
