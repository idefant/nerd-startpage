import jsyaml from 'js-yaml';
import Swal from 'sweetalert2';
import store from '../store';
import { TConfig } from '../types';
import { fetchConfig } from './requests';

const config = store.config;

export const reloadConfig = async () => {
  try {
    const newConfigYaml = await fetchConfig();
    if (!newConfigYaml) return;
    config.data = jsyaml.load(newConfigYaml) as TConfig;
  } catch (e) {
    Swal.fire({
      title: 'An error occurred while parsing the config',
      icon: 'error',
    });
  }
};

export const openConfigPopup = () => {
  Swal.fire({
    title: 'Input config URL',
    text: 'JSON or YAML formats are supported',
    input: 'url',
    inputPlaceholder: 'Enter your config URL',
    inputValue: config.url,
  }).then((result) => {
    if (result.isConfirmed) {
      config.url = result.value;
    }
  });
};
