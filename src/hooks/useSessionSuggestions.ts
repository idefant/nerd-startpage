import { useEffect, useMemo, useState } from 'react';
import { SetRequired } from 'type-fest';
import browser from 'webextension-polyfill';

import { Suggestion } from '#types/suggestionType';

type Session = browser.Sessions.Session;

export const useSessionSuggestions = (isEnabled = true) => {
  const [sessionList, setSessionList] = useState<Session[]>();

  useEffect(() => {
    if (!isEnabled) {
      setSessionList(undefined);
      return;
    }

    (async () => {
      const sessionList = await browser.sessions.getRecentlyClosed();
      setSessionList(sessionList);
    })();
  }, [isEnabled]);

  const suggestions = useMemo<Suggestion[]>(
    () =>
      (sessionList || [])
        .filter((session): session is SetRequired<Session, 'tab'> => !!session.tab)
        .filter((session) => !session.tab.url?.startsWith(origin))
        .slice(0, 20)
        .map((session) => ({
          title: session.tab?.title,
          extra: session.tab?.url,
          onClick: () => {
            if (!session.tab.id) return;
            browser.sessions.restore(session.tab.id.toString());
          },
        })),
    [sessionList],
  );

  return suggestions;
};
