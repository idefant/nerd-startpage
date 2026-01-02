export type ModifierCombo =
  | ''
  | 's'
  | 'c'
  | 'a'
  | 'w'
  | 'sc'
  | 'sa'
  | 'sw'
  | 'ca'
  | 'cw'
  | 'aw'
  | 'sca'
  | 'scw'
  | 'caw'
  | 'scaw';

type Event = {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

/** Получение примененных модификаторов */
export const getModifiers = (event: Event): ModifierCombo => {
  const modifiers: string[] = [];
  if (event.shiftKey) {
    modifiers.push('s');
  }
  if (event.ctrlKey) {
    modifiers.push('c');
  }
  if (event.altKey) {
    modifiers.push('a');
  }
  if (event.metaKey) {
    modifiers.push('w');
  }
  return modifiers as unknown as ModifierCombo;
};
