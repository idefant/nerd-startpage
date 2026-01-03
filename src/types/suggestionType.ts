import { ModifierCombo, ModifiersOnlyEvent } from '#utils/modifiers';

export type Suggestion = {
  title?: string;
  extra?: string;
  // XXX: Добавить описание к каждой команде
  actions?: { [key in ModifierCombo]?: (e: ModifiersOnlyEvent) => void };
};
