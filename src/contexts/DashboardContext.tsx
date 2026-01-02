import { createContext, useContextSelector } from 'use-context-selector';

import { Mode } from '#types/modeType';

type DashboardContextValue = {
  query: string;
  debouncedQuery: string;
  setQuery: (value: string | ((value: string) => string), immediately?: boolean) => void;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export const DashboardContext = createContext<DashboardContextValue>({
  query: '',
  debouncedQuery: '',
  setQuery: () => {},
  setMode: () => {},
  inputRef: { current: null },
});

export function useDashboardContext<T>(selector: (ctx: DashboardContextValue) => T): T {
  return useContextSelector(DashboardContext, (ctx) => {
    if (!ctx) {
      throw new Error('useDashboardContext must be used within <DashboardContext.Provider>');
    }
    return selector(ctx);
  });
}
