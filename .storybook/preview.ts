import type { Preview } from '@storybook/react';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // docs: {
    //   theme: themes.dark,
    // },
    // backgrounds: {
    //   values: [
    //     { name: 'Dark', value: 'var(--bg)' },
    //     { name: 'Dark - Paper', value: 'var(--bg-paper)' },
    //   ],
    //   default: 'Dark - Paper',
    // },
  },
  // decorators: [
  //   (Story) => (
  //     <BrowserRouter>
  //       <Story />
  //       <DialogModalContainer />
  //       <ScrollLockWatcher />
  //     </BrowserRouter>
  //   ),
  // ],
};

export default preview;
