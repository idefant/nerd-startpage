export const getGoogleSearchUrl = (q: string) => {
  const urlParams = new URLSearchParams({ q });
  return `https://www.google.com/search?${urlParams}`;
};

export const getYandexSearchUrl = (q: string) => {
  const urlParams = new URLSearchParams({ text: q });
  return `https://ya.ru/search/?${urlParams}`;
};
