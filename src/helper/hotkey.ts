import store from '../store';
import { TAdditionalKeys, TKeyDetails } from '../types';

const config = store.config;

class Hotkey {
  keysDetail: TKeyDetails[];

  constructor(hotkeysText: string) {
    this.keysDetail = this.parseKeysText(hotkeysText);
  }

  parseKeysText(hotkeysText: string) {
    const hotkeysList = hotkeysText.toLowerCase().replaceAll(' ', '').split(',');

    return hotkeysList.map((key) =>
      key.split('+').reduce(
        (acc: TKeyDetails, hotkeyPart) => {
          const actions: Record<TAdditionalKeys, () => void> = {
            ctrl: () => (acc.ctrl = true),
            shift: () => (acc.shift = true),
            alt: () => (acc.alt = true),
          };

          if (hotkeyPart in actions) {
            actions[hotkeyPart as TAdditionalKeys]();
          } else {
            acc.key = hotkeyPart;
          }

          return acc;
        },
        { ctrl: false, shift: false, alt: false, key: '' }
      )
    );
  }

  compareWithEvent(e: KeyboardEvent) {
    return this.keysDetail.some(
      (keyDetail) =>
        keyDetail.ctrl === e.ctrlKey &&
        keyDetail.shift === e.shiftKey &&
        keyDetail.alt === e.altKey &&
        keyDetail.key === e.key.toLowerCase()
    );
  }
}

export const hotkey = (
  hotkeysStr: string,
  callback: () => void,
  params: { elem?: Element | null; preventDefault?: boolean }
) => {
  const elem = params.elem || window;
  const hotkey = new Hotkey(hotkeysStr);
  const listener = (e: Event) => {
    if (hotkey.compareWithEvent(e as KeyboardEvent)) {
      callback();
      if (params.preventDefault ?? true) {
        e.preventDefault();
      }
    }
  };

  elem.addEventListener('keydown', listener);
  return () => elem.removeEventListener('keydown', listener);
};

export const getLinkByHotkey = (hotkey: string) => {
  for (const category of config.data.categories) {
    for (const link of category.links) {
      if (link.hotkey?.toLowerCase() === hotkey.toLowerCase()) {
        return link;
      }
    }
  }
};

export const getHotkey = (searchValue: string) =>
  searchValue.slice(config.data.hotkeyLeader.length);
