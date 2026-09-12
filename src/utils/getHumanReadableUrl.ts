import punycode from 'punycode/';

type DecodeHumanOptions = {
  plusAsSpace?: boolean;
};

function decodeHuman(value: string, { plusAsSpace = false }: DecodeHumanOptions = {}): string {
  const input = plusAsSpace ? value.replace(/\+/g, ' ') : value;

  try {
    return decodeURIComponent(input);
  } catch (error) {
    return input;
  }
}

function decodePathname(pathname: string): string {
  // decodeURIComponent не трогает '+', а в path обычно его и не бывает.
  // Декодируем сегменты, чтобы аккуратно переживать странные случаи.
  return pathname
    .split('/')
    .map((seg) => decodeHuman(seg))
    .join('/');
}

function decodeQuery(search: string): string {
  if (!search) return '';
  const raw = search.slice(1);

  // сохраняем структуру k=v&k2=v2 (и случаи без "=")
  const parts = raw.split('&').map((pair) => {
    if (pair === '') return '';

    const eqIdx = pair.indexOf('=');
    const hasEq = eqIdx !== -1;

    const rawKey = hasEq ? pair.slice(0, eqIdx) : pair;
    const rawVal = hasEq ? pair.slice(eqIdx + 1) : '';

    const key = decodeHuman(rawKey, { plusAsSpace: true });
    const val = hasEq ? decodeHuman(rawVal, { plusAsSpace: true }) : '';

    return hasEq ? `${key}=${val}` : key;
  });

  return parts.join('&');
}

function decodeHash(hash: string): string {
  if (!hash) return '';
  const raw = hash.slice(1);

  // Иногда люди пихают в hash query-формат с '+'.
  return decodeHuman(raw, { plusAsSpace: true });
}

export function decodeUrlHuman(urlStr: string): string {
  // Поддержим и URL без схемы (vkvideo.ru/?q=...), чтобы не падать
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(urlStr);
  const parseInput = hasScheme ? urlStr : `https://${urlStr}`;

  let url: URL;
  try {
    url = new URL(parseInput);
  } catch {
    // Если совсем не похоже на URL — попробуем просто "человечить" строку
    const fallback = decodeHuman(urlStr);
    return fallback;
  }

  // punycode для домена
  const hostUnicode = punycode.toUnicode(url.hostname);

  const port = url.port ? `:${url.port}` : '';
  const pathname = decodePathname(url.pathname);

  const query = decodeQuery(url.search);
  const hash = decodeHash(url.hash);

  // Собираем "человекочитаемо" (может быть невалидным URL)
  const decoded =
    `${url.protocol}//${hostUnicode}${port}` +
    `${pathname}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;

  return decoded;
}
