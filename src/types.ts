export type TCategory = {
  name: string;
  links: TLink[];
};

export type TLink = {
  name: string;
  url: string;
  hotkey?: string;
};

export type TConfig = {
  hotkeyLeader: string;
  columns: {
    gap: number;
    width: number;
    maxCount: number;
  };
  mappings: {
    suggestionNext: string[];
    suggestionPrev: string[];
    showSearch: string[];
    showHistory: string[];
    showBookmarks: string[];
  };
  categories: TCategory[];
};

export type TAdditionalKeys = 'ctrl' | 'shift' | 'alt';

export type TKeyDetails = {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string | null;
};

export type TSuggestionsMode = 'search' | 'history' | 'bookmarks';

export type TVisitedSuggestion = { title?: string; url?: string };
