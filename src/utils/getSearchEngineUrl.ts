export const getGoogleSearchUrl = (q: string) => {
  const urlParams = new URLSearchParams({ q });
  return `https://www.google.com/search?${urlParams}`;
};

export const getYandexSearchUrl = (q: string) => {
  const urlParams = new URLSearchParams({ text: q });
  return `https://ya.ru/search/?${urlParams}`;
};

export const getNpmSearchUrl = (q: string) => {
  const urlParams = new URLSearchParams({ q });
  return `https://www.npmjs.com/search?${urlParams}`;
};

export const getBundlePhobiaPackageUrl = (name: string, version: string) =>
  `https://bundlephobia.com/package/${name}@${version}`;
