import { FC, useCallback, useMemo } from 'react';

import { useDashboardContext } from '#contexts/DashboardContext';
import { useAppSelector } from '#hooks/reduxHooks';
import { Suggestion } from '#types/suggestionType';
import SuggestionList from '#ui/SuggestionList';
import { ModifiersOnlyEvent } from '#utils/modifiers';
import { openUrl } from '#utils/openUrl';

const LinkSuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.query);

  const { config } = useAppSelector((state) => state.config);

  const links = useMemo(
    () => config.categories.flatMap((category) => category.links),
    [config.categories],
  );

  const suggestions = useMemo<Suggestion[]>(() => {
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
      actions: {
        '': () => openUrl(link.url),
        c: () => openUrl(link.url, true),
      },
    }));
  }, [links, query]);

  const handleEnterQuery = useCallback(
    (e: ModifiersOnlyEvent) => {
      if (!query) return;

      const links = config.categories.flatMap((category) => category.links);
      const foundLink = links.find((link) => link.alias === query.trim());
      if (!foundLink) return;
      openUrl(foundLink.url, e.ctrlKey);
    },
    [config.categories, query],
  );

  return <SuggestionList suggestions={suggestions} onEnterWithoutSuggestion={handleEnterQuery} />;
};

export default LinkSuggestions;
