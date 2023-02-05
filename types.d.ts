declare module '*config.yaml' {
  const data: {
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
    categories: {
      name: string;
      links: {
        name: string;
        url: string;
        hotkey?: string;
      }[];
    }[];
  };
  export default data;
}
