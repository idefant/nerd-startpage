import { useEffect, useMemo, useState } from 'react';
import { SetRequired } from 'type-fest';
import browser from 'webextension-polyfill';

import { Suggestion } from '#types/suggestionType';

type Session = browser.Sessions.Session;

export const useSessionSuggestions = (query: string, isEnabled = true) => {
  const [sessionList, setSessionList] = useState<Session[]>();

  useEffect(() => {
    if (!isEnabled) {
      setSessionList(undefined);
      return;
    }

    const callback = async () => {
      const sessionList = await browser.sessions.getRecentlyClosed();
      setSessionList(sessionList);
    };
    callback();

    browser.sessions.onChanged.addListener(callback);
    return () => browser.sessions.onChanged.removeListener(callback);
  }, [isEnabled]);

  const suggestions = useMemo<Suggestion[]>(
    () =>
      (sessionList || [])
        .filter((session): session is SetRequired<Session, 'tab'> => !!session.tab)
        .filter((session) => !session.tab.url?.startsWith(origin))
        .filter((session) => {
          if (!query) return true;
          return (
            session.tab.title?.toLowerCase().includes(query.toLowerCase()) ||
            session.tab.url?.toLowerCase().includes(query.toLowerCase())
          );
        })
        .slice(0, 20)
        .map((session) => ({
          title: session.tab?.title,
          extra: session.tab?.url,
          onClick: () => {
            if (!session.tab.sessionId) return;
            browser.sessions.restore(session.tab.sessionId);
          },
        })),
    [query, sessionList],
  );

  return suggestions;
};
