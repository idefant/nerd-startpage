import { TConfig } from '../types';

import defaultConfig from '../../config.yaml';

class ConfigStore {
  private _url = localStorage.getItem('config_url') || undefined;
  private _data: TConfig = defaultConfig;

  constructor() {
    const configLS = localStorage.getItem('config');
    if (configLS) {
      this._data = JSON.parse(configLS);
    }
  }

  public get url() {
    return this._url;
  }

  public set url(url: string | undefined) {
    this._url = url;
    if (url) {
      localStorage.setItem('config_url', url);
    } else {
      localStorage.removeItem('config_url');
    }
  }

  public get data() {
    return this._data;
  }

  public set data(config: TConfig) {
    this._data = config;
    if (config) {
      localStorage.setItem('config', JSON.stringify(config));
    } else {
      localStorage.removeItem('config');
    }
  }
}

export default ConfigStore;
