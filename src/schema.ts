import { array, number, object, string } from 'yup';

export const configSchema = object({
  gap: number().positive().default(20),
  colWidth: number().positive().default(200),
  hotkeyLeader: string().default(':'),
  mappings: object({
    suggestionNext: string().default('ctrl+j, alt+j, ArrowDown'),
    suggestionPrev: string().default('ctrl+k, alt+k, ArrowUp'),
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
