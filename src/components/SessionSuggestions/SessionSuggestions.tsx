import { FC, useEffect, useMemo, useState } from 'react';
import { SetRequired } from 'type-fest';
import browser from 'webextension-polyfill';

import { useDashboardContext } from '#contexts/DashboardContext';
import { Suggestion } from '#types/suggestionType';
import SuggestionList from '#ui/SuggestionList';

type Session = browser.Sessions.Session;

const SessionSuggestions: FC = () => {
  const query = useDashboardContext((ctx) => ctx.query);

  const [sessionList, setSessionList] = useState<Session[]>();

  useEffect(() => {
    const callback = async () => {
      const sessionList = await browser.sessions.getRecentlyClosed();
      setSessionList(sessionList);
    };
    callback();

    browser.sessions.onChanged.addListener(callback);
    return () => browser.sessions.onChanged.removeListener(callback);
  }, []);

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
          actions: {
            '': () => {
              if (!session.tab.sessionId) return;
              browser.sessions.restore(session.tab.sessionId);
            },
          },
        })),
    [query, sessionList],
  );

  return <SuggestionList suggestions={suggestions} />;
};

export default SessionSuggestions;
