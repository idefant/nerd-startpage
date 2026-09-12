import { openUrl } from '#utils/openUrl';

export const openYandex = (options?: { newTab?: boolean }) =>
  openUrl('https://ya.ru', options?.newTab);
