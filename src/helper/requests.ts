import axios, { isAxiosError } from 'axios';
import Swal from 'sweetalert2';
import store from '../store';

const config = store.config;

export const fetchSuggestions = async (searchValue: string): Promise<string[] | undefined> => {
  const res = await axios('https://suggestqueries.google.com/complete/search', {
    params: { client: 'chrome', q: searchValue },
  });
  return res.data[1];
};

export const fetchConfig = async (): Promise<string | undefined> => {
  if (!config.url) {
    Swal.fire({ title: 'The config URL has not been configured yet', icon: 'warning' });
    return;
  }

  try {
    const res = await axios(config.url);
    return res.data;
  } catch (e) {
    Swal.fire({
      title: isAxiosError(e) ? e.message : 'An error occurred during the request',
      icon: 'error',
    });
  }
};
