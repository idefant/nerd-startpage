import { z } from 'zod';

import { configSchema } from '#schema/configSchema';

export type Config = z.infer<typeof configSchema>;
