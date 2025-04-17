import { z } from 'zod';

import { colorList } from '#types/colorType';
import { modeList } from '#types/modeType';

export const configSchema = z.object({
  editConfigUrl: z.string().optional(),
  defaultMode: z.enum(modeList).optional(),
  columns: z
    .object({
      gap: z.number().optional(),
      width: z.number().optional(),
      maxCount: z.number().optional(),
    })
    .optional(),

  mappings: z
    .object({
      nextSuggestion: z.array(z.string()).optional(),
      prevSuggestion: z.array(z.string()).optional(),
      searchOnGoogle: z.array(z.string()).optional(),
      searchOnYandex: z.array(z.string()).optional(),
      searchOnNpm: z.array(z.string()).optional(),
      searchInHistory: z.array(z.string()).optional(),
      searchInBookmarks: z.array(z.string()).optional(),
      searchInSessions: z.array(z.string()).optional(),
      commandPalette: z.array(z.string()).optional(),
      clearInput: z.array(z.string()).optional(),
      openLinkFromClipboard: z.array(z.string()).optional(),
      openGoogle: z.array(z.string()).optional(),
      openYandex: z.array(z.string()).optional(),
      searchOnGoogleFromClipboard: z.array(z.string()).optional(),
      searchOnYandexFromClipboard: z.array(z.string()).optional(),
      editConfig: z.array(z.string()).optional(),
      showConfig: z.array(z.string()).optional(),
      reloadConfig: z.array(z.string()).optional(),
      setConfigUrlFromClipboard: z.array(z.string()).optional(),
      showMyIP: z.array(z.string()).optional(),
    })
    .optional(),

  categories: z
    .array(
      z.object({
        name: z.string(),
        color: z.enum(colorList).optional(),
        links: z.array(
          z.object({
            name: z.string(),
            icon: z.string().optional(),
            url: z.string().url(),
            hotkey: z.string().optional(),
          }),
        ),
      }),
    )
    .optional(),
});

export const hotkeysCommandList = Object.entries(
  configSchema.shape.mappings.unwrap().keyof().options,
).map(([, key]) => key);
