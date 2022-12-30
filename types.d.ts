declare module '*config.yaml' {
  const data: {
    gap: number;
    colWidth: number;
    hotkeyLeader: string;
    mappings: {
      suggestionNext: string;
      suggestionPrev: string;
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
