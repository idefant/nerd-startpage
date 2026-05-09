import YAML from 'yaml';

import { configSchema } from '#schema/configSchema';
import { Config } from '#types/configType';
import { removeNullObjectValues } from '#utils/removeNullObjectValues';

import defaultConfigYaml from '../../config.yaml?raw';

export const defaultConfig: Config = configSchema.parse(
  removeNullObjectValues(YAML.parse(defaultConfigYaml) ?? {}),
);
