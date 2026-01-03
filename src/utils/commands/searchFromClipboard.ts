import { getGoogleSearchUrl, getYandexSearchUrl } from '#utils/getSearchEngineUrl';
import { getTextFromClipboard } from '#utils/getTextFromClipboard';
import { openUrl } from '#utils/openUrl';

export const searchFromClipboard = async (options?: {
  engine?: 'google' | 'yandex';
  newTab?: boolean;
}) => {
  const query = await getTextFromClipboard();
  if (!query) return;

  const getSearchUrl = {
    google: getGoogleSearchUrl,
    yandex: getYandexSearchUrl,
  }[options?.engine ?? 'google'];

  openUrl(getSearchUrl(query), options?.newTab);
};
