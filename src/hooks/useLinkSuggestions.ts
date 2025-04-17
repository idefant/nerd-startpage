import { useMemo } from 'react';

import { Suggestion } from '#types/suggestionType';
import { openUrl } from '#utils/openUrl';

import { useAppSelector } from './reduxHooks';

export const useLinkSuggestions = (query: string, isEnabled = true) => {
  const { config } = useAppSelector((state) => state.config);

  const links = useMemo(
    () => (config?.categories || []).flatMap((category) => category.links),
    [config?.categories],
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!isEnabled) return [];

    const trimmedQuery = query.trim();

    if (!trimmedQuery) return [];

    const filteredLinks = links
      .filter(
        (link) =>
          link.alias === trimmedQuery || link.name.includes(query) || link.url.includes(query),
      )
      .sort((a, b) => (b.alias === trimmedQuery ? 1 : 0) - (a.alias === trimmedQuery ? 1 : 0));

    return filteredLinks.map((link) => ({
      title: link.alias ? `${link.name} - ${link.alias}` : link.name,
      extra: link.url,
      onClick: (e) => openUrl(link.url, e?.ctrlKey),
    }));
  }, [isEnabled, links, query]);

  return suggestions;
};
