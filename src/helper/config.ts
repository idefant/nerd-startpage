import jsyaml from 'js-yaml';
import Swal from 'sweetalert2';
import { ValidationError } from 'yup';
import { configSchema } from '../schema';
import store from '../store';
import { fetchConfig } from './requests';

const config = store.config;

const parseYamlConfig = (configText: string) => {
  try {
    return jsyaml.load(configText);
  } catch {
    Swal.fire({
      title: 'An error occurred while parsing the config',
      icon: 'error',
    });
  }
};

export const reloadConfig = async () => {
  const newConfigText = await fetchConfig();
  if (!newConfigText) return;

  await configSchema
    .validate(parseYamlConfig(newConfigText))
    .then((data) => {
      config.data = data;
      Swal.fire({ title: 'Data has been successfully updated', icon: 'success' });
    })
    .catch((e: ValidationError) => {
      Swal.fire({ title: 'Config does not match the scheme', text: e.message, icon: 'error' });
    });
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
