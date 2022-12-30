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
  gap: number;
  colWidth: number;
  hotkeyLeader: string;
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
