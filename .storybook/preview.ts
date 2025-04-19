import type { Preview } from '@storybook/react';

import { themes } from '@storybook/theming';

import 'modern-normalize/modern-normalize.css';
import '../src/styles/index.scss';
import '../src/styles/global.scss';
import '../src/styles/themes/dark.scss';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
    backgrounds: {
      values: [
        { name: 'Dark', value: 'var(--bg)' },
        { name: 'Dark - Paper', value: 'var(--bg-paper)' },
      ],
      default: 'Dark',
    },
  },
};

export default preview;
