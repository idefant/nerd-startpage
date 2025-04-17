import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';
import YAML from 'yaml';

import { configSchema } from '#schema/configSchema';

export const mainApi = createApi({
  reducerPath: 'api/main',
  baseQuery: fetchBaseQuery({}),
  endpoints: (builder) => ({
    fetchConfig: builder.query<any, { configUrl: string }>({
      query: ({ configUrl }) => ({
        url: configUrl,
        method: 'GET',
        params: { dt: Date.now() },
        responseHandler: async (response) => {
          if (!response.ok) return response;

          const text = await response.text();
          try {
            const parsedConfig = YAML.parse(text);
            const validationResult = await configSchema.safeParseAsync(parsedConfig);
            if (validationResult.error) {
              toast.error('Ошибка в конфигурации. Смотри в консоль');
              console.log(validationResult.error);
              return;
            }
            toast.success('Конфигурация успешно обновлена');
            return validationResult.data;
          } catch {
            const message = 'Не удалось распарсить конфигурацию';
            toast.error(message);
            return { error: { message } };
          }
        },
      }),
    }),
    fetchGoogleSuggestions: builder.query<[unknown, string[]], { query: string }>({
      query: ({ query }) => ({
        url: 'https://suggestqueries.google.com/complete/search',
        method: 'GET',
        params: { client: 'chrome', q: query },
      }),
    }),
    fetchYandexSuggestions: builder.query<[unknown, string[], unknown], { query: string }>({
      query: ({ query }) => ({
        url: 'https://ya.ru/suggest/suggest-ya.cgi',
        method: 'GET',
        params: { v: 4, part: query },
      }),
    }),
    fetchMyIp: builder.query<{ ip: string; country: string; cc: string }, undefined>({
      query: () => ({
        url: 'https://api.myip.com',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLazyFetchConfigQuery,
  useFetchGoogleSuggestionsQuery,
  useFetchYandexSuggestionsQuery,
  useLazyFetchMyIpQuery,
} = mainApi;
