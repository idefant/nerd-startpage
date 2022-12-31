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
  };
  mappings: {
    suggestionNext: string;
    suggestionPrev: string;
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
