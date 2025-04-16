import { useEffect, useMemo, useState } from 'react';
import { SetRequired } from 'type-fest';
import browser from 'webextension-polyfill';

import { Suggestion } from '#types/suggestionType';
import { openUrl } from '#utils/openUrl';

type Bookmark = browser.Bookmarks.BookmarkTreeNode;

export const useBookmarkSuggestions = (query: string, isEnabled = true) => {
  const [bookmarkList, setBookmarkList] = useState<Bookmark[]>();

  useEffect(() => {
    if (!isEnabled) {
      setBookmarkList(undefined);
      return;
    }

    (async () => {
      const bookmarkList = query
        ? await browser.bookmarks.search(query)
        : await browser.bookmarks.getRecent(20);
      setBookmarkList(bookmarkList);
    })();
  }, [isEnabled, query]);

  const suggestions = useMemo<Suggestion[]>(
    () =>
      (bookmarkList || [])
        .filter((bookmark): bookmark is SetRequired<Bookmark, 'url'> => !!bookmark.url)
        .slice(0, 20)
        .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
        .map((bookmark) => ({
          title: bookmark.title,
          extra: bookmark.url,
          onClick: (e) => {
            openUrl(bookmark.url, e?.ctrlKey);
          },
        })),
    [bookmarkList],
  );

  return suggestions;
};
