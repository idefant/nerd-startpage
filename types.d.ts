declare module '*config.yaml' {
  const data: {
    hotkeyLeader: string;
    columns: {
      gap: number;
      width: number;
    };
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
