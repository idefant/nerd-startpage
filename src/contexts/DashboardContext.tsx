import { createContext, useContextSelector } from 'use-context-selector';

import { ModeName } from '#types/modeType';

type DashboardContextValue = {
  query: string;
  debouncedQuery: string;
  setQuery: (value: string | ((value: string) => string), immediately?: boolean) => void;
  setMode: React.Dispatch<React.SetStateAction<ModeName>>;
  searchBoxRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export const DashboardContext = createContext<DashboardContextValue>({
  query: '',
  debouncedQuery: '',
  setQuery: () => {},
  setMode: () => {},
  searchBoxRef: { current: null },
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
