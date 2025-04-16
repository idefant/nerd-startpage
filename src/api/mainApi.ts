import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';
import YAML from 'yaml';

export const mainApi = createApi({
  reducerPath: 'api/main',
  baseQuery: fetchBaseQuery({}),
  endpoints: (builder) => ({
    fetchConfig: builder.query<any, { configUrl: string }>({
      query: ({ configUrl }) => ({
        url: configUrl,
        method: 'GET',
        responseHandler: async (response) => {
          if (!response.ok) return response;

          const text = await response.text();
          try {
            const res = YAML.parse(text);
            toast.success('Конфигурация успешно обновлена');
            return { data: res };
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
  }),
});

export const {
  useLazyFetchConfigQuery,
  useFetchGoogleSuggestionsQuery,
  useFetchYandexSuggestionsQuery,
} = mainApi;
