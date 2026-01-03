import { z } from 'zod';

import { colorList } from '#data/color';

const genModeCommandSchema = (options?: {
  hotkey?: string | string[];
  leaderSequence?: string | string[];
  /** @default true */
  showInCommandPalette?: boolean;
  /** @default false */
  disabled?: boolean;
}) =>
  z
    .object({
      hotkey: z
        .string()
        .or(z.array(z.string()))
        .default(options?.hotkey ?? []),
      leaderSequence: z
        .string()
        .or(z.array(z.string()))
        .default(options?.leaderSequence ?? []),
      showInCommandPalette: z.boolean().default(options?.showInCommandPalette ?? true),
      disabled: z.boolean().default(options?.disabled ?? false),
    })
    .prefault({});

export const modesSchema = z
  .object({
    google: genModeCommandSchema({ hotkey: 'ctrl+g' }),
    yandex: genModeCommandSchema({ hotkey: 'ctrl+y' }),
    npm: genModeCommandSchema({ showInCommandPalette: false }),
    history: genModeCommandSchema({ hotkey: 'ctrl+h' }),
    bookmarks: genModeCommandSchema({ hotkey: 'ctrl+b' }),
    sessions: genModeCommandSchema({ hotkey: 'ctrl+s' }),
    links: genModeCommandSchema({ hotkey: 'ctrl+f' }),
    commandPalette: genModeCommandSchema({ hotkey: 'ctrl+p', showInCommandPalette: false }),
  })
  .prefault({});

const modeList = modesSchema.unwrap().keyof().options;

export const commandsSchema = z
  .object({
    nextSuggestion: genModeCommandSchema({ hotkey: 'ArrowDown', showInCommandPalette: false }),
    prevSuggestion: genModeCommandSchema({ hotkey: 'ArrowUp', showInCommandPalette: false }),
    clearInput: genModeCommandSchema({ hotkey: 'ctrl+l', showInCommandPalette: false }),
    openLinkFromClipboard: genModeCommandSchema(),
    openGoogle: genModeCommandSchema(),
    openYandex: genModeCommandSchema(),
    searchOnGoogleFromClipboard: genModeCommandSchema(),
    searchOnYandexFromClipboard: genModeCommandSchema(),
    editConfig: genModeCommandSchema(),
    showConfig: genModeCommandSchema(),
    reloadConfig: genModeCommandSchema(),
    setConfigUrlFromClipboard: genModeCommandSchema(),
    showMyIP: genModeCommandSchema(),
  })
  .prefault({});

export const configSchema = z
  .object({
    editConfigUrl: z.string().optional(),
    defaultMode: z.enum(modeList).default('google'),
    leaderKey: z.string().default(':'),

    columns: z
      .object({
        gap: z.number().default(24),
        width: z.number().default(200),
        maxCount: z.number().default(6),
      })
      .prefault({}),

    modes: modesSchema,
    commands: commandsSchema,

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
              alias: z.string().optional(),
            }),
          ),
        }),
      )
      .default([]),
  })
  .prefault({});
