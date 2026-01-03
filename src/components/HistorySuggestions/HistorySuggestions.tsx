import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SetRequired } from 'type-fest';
import browser from 'webextension-polyfill';

import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { useDashboardContext } from '#contexts/DashboardContext';
import { Suggestion } from '#types/suggestionType';
import SuggestionList, { SuggestionListRef } from '#ui/SuggestionList';
import { decodeUrlHuman } from '#utils/getHumanReadableUrl';
import { openUrl } from '#utils/openUrl';

type HistoryItem = browser.History.HistoryItem;

const HistorySuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.query);
  const setQuery = useDashboardContext((ctx) => ctx.setQuery);
  const setMode = useDashboardContext((ctx) => ctx.setMode);

  const suggestionListRef = useRef<SuggestionListRef>(null);

  const [historyList, setHistoryList] = useState<HistoryItem[]>();

  useEffect(() => {
    (async () => {
      const historyList = await browser.history.search({
        text: query,
        startTime: Date.now() - 365 * 24 * 60 * 60 * 1000,
        maxResults: 20,
      });
      const filteredHistoryList = historyList.filter(
        (historyItem) => !historyItem.url?.startsWith('file:///'),
      );
      setHistoryList(filteredHistoryList);
    })();
  }, [query]);

  const suggestions = useMemo<Suggestion[]>(
    () =>
      (historyList || [])
        .filter((historyItem): historyItem is SetRequired<HistoryItem, 'url'> => !!historyItem.url)
        .map((historyItem) => ({
          title: historyItem.title,
          extra: decodeUrlHuman(historyItem.url),
          actions: {
            '': () => openUrl(historyItem.url),
            c: () => openUrl(historyItem.url, true),
          },
        })),
    [historyList],
  );

  useHotkeys(
    'alt+e',
    () => {
      const suggestion = suggestionListRef.current?.currentSuggestion;
      if (!suggestion) return;

      const link = suggestion.extra;
      if (!link) return;

      setMode('google');
      setQuery(link, true);
    },
    { ...hotkeyHookConfig, scopes: 'suggestions' },
  );

  return <SuggestionList suggestions={suggestions} ref={suggestionListRef} />;
};

export default HistorySuggestions;
