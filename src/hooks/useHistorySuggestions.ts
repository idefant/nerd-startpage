import { useEffect, useMemo, useState } from 'react';
import { SetRequired } from 'type-fest';
import browser from 'webextension-polyfill';

import { Suggestion } from '#types/suggestionType';
import { openUrl } from '#utils/openUrl';

type HistoryItem = browser.History.HistoryItem;

export const useHistorySuggestions = (query: string, isEnabled = true) => {
  const [historyList, setHistoryList] = useState<HistoryItem[]>();

  useEffect(() => {
    if (!isEnabled) {
      setHistoryList(undefined);
      return;
    }

    (async () => {
      const historyList = await browser.history.search({
        text: query,
        startTime: Date.now() - 365 * 24 * 60 * 60 * 1000,
        maxResults: 20,
      });
      setHistoryList(historyList);
    })();
  }, [isEnabled, query]);

  const suggestions = useMemo<Suggestion[]>(
    () =>
      (historyList || [])
        .filter((historyItem): historyItem is SetRequired<HistoryItem, 'url'> => !!historyItem.url)
        .map((historyItem) => ({
          title: historyItem.title,
          extra: historyItem.url,
          onClick: (e) => {
            openUrl(historyItem.url, e?.ctrlKey);
          },
        })),
    [historyList],
  );

  return suggestions;
};
