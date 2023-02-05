import { array, number, object, string } from 'yup';

export const configSchema = object({
  hotkeyLeader: string().default(':'),
  columns: object({
    gap: number().positive().default(20),
    width: number().positive().default(200),
    maxCount: number().positive().default(6),
  }),
  mappings: object({
    suggestionNext: array(string().required()).default(['ctrl+j', 'ArrowDown']),
    suggestionPrev: array(string().required()).default(['ctrl+k', 'ArrowUp']),
    showSearch: array(string().required()).default(['ctrl+s']),
    showHistory: array(string().required()).default(['ctrl+h']),
    showBookmarks: array(string().required()).default(['ctrl+b']),
  }),
  categories: array(
    object({
      name: string().required(),
      links: array(
        object({
          name: string().required(),
          url: string().required(),
          hotkey: string(),
        })
      )
        .min(1, 'The category must contain at least one link')
        .required(),
    })
  ).default([]),
});
