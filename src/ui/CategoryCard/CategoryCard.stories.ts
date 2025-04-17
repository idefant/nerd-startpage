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

export const White: Story = {
  args: { ...WithIcons.args, color: 'white' },
};

export const Red: Story = {
  args: { ...WithIcons.args, color: 'red' },
};

export const Orange: Story = {
  args: { ...WithIcons.args, color: 'orange' },
};

export const Yellow: Story = {
  args: { ...WithIcons.args, color: 'yellow' },
};

export const Green: Story = {
  args: { ...WithIcons.args, color: 'green' },
};

export const LightGreen: Story = {
  args: { ...WithIcons.args, color: 'lightGreen' },
};

export const LightBlue: Story = {
  args: { ...WithIcons.args, color: 'lightBlue' },
};

export const Blue: Story = {
  args: { ...WithIcons.args, color: 'blue' },
};

export const Violet: Story = {
  args: { ...WithIcons.args, color: 'violet' },
};

export const Pink: Story = {
  args: { ...WithIcons.args, color: 'pink' },
};
