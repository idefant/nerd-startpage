import { openUrl } from '#utils/openUrl';

export const openGoogle = (options?: { newTab?: boolean }) =>
  openUrl('https://google.com', options?.newTab);
