import { CategoryCard } from './CategoryCard';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'UI/CategoryCard',
  component: CategoryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CategoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Code',
    links: [
      {
        name: 'NPM',
        url: 'https://npmjs.com',
      },
      {
        name: 'Github',
        url: 'https://github.com',
      },
      {
        name: 'Docker_Hub',
        url: 'https://hub.docker.com',
      },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    name: ' Code',
    links: [
      {
        name: 'NPM',
        url: 'https://npmjs.com',
        icon: '',
      },
      {
        name: 'Github',
        url: 'https://github.com',
        icon: '',
      },
      {
        name: 'Docker_Hub',
        url: 'https://hub.docker.com',
        icon: '',
      },
    ],
  },
};
