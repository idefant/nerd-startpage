import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SetRequired } from 'type-fest';
import browser from 'webextension-polyfill';

import { hotkeyHookConfig } from '#configs/reactHotkeyHookConfig';
import { useDashboardContext } from '#contexts/DashboardContext';
import { Suggestion } from '#types/suggestionType';
import SuggestionList, { SuggestionListRef } from '#ui/SuggestionList';
import { openUrl } from '#utils/openUrl';

type Bookmark = browser.Bookmarks.BookmarkTreeNode;

const BookmarkSuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.query);
  const setQuery = useDashboardContext((ctx) => ctx.setQuery);
  const setMode = useDashboardContext((ctx) => ctx.setMode);

  const suggestionListRef = useRef<SuggestionListRef>(null);

  const [bookmarkList, setBookmarkList] = useState<Bookmark[]>();

  useEffect(() => {
    (async () => {
      const bookmarkList = query
        ? await browser.bookmarks.search(query)
        : await browser.bookmarks.getRecent(20);
      const filteredBookmarkList = bookmarkList.filter(
        (bookmark) => !bookmark.url?.startsWith('file:///'),
      );
      setBookmarkList(filteredBookmarkList);
    })();
  }, [query]);

  const suggestions = useMemo<Suggestion[]>(
    () =>
      (bookmarkList || [])
        .filter((bookmark): bookmark is SetRequired<Bookmark, 'url'> => !!bookmark.url)
        .slice(0, 20)
        .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
        .map((bookmark) => ({
          title: bookmark.title,
          extra: bookmark.url,
          actions: {
            '': () => openUrl(bookmark.url),
            c: () => openUrl(bookmark.url, true),
          },
        })),
    [bookmarkList],
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

export default BookmarkSuggestions;
