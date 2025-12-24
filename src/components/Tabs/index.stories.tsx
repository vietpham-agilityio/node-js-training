import type { Meta, StoryObj } from '@storybook/react-native';

// Components
import { Tabs } from './index';

// Types
interface Tab {
  id: string;
  label: string;
}

const meta: Meta<typeof Tabs> = {
  title: 'Tabs',
  component: Tabs,
  parameters: {
    notes:
      'A tab navigation component with primary and secondary variants. Primary variant displays tabs with rounded background and gradient for active state. Secondary variant shows tabs with bottom indicator line for active state. Supports horizontal scrolling for multiple tabs.',
  },
  argTypes: {
    tabs: {
      control: 'object',
      description: 'Array of tab objects with id and label properties',
    },
    activeTab: {
      control: 'text',
      description: 'ID of the currently active tab',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description:
        'Tab style variant - primary: rounded with gradient background, secondary: with bottom indicator line',
    },
    onTabChange: {
      action: 'tab changed',
      description: 'Callback function called when tab is pressed with tab ID',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const defaultTabs: Tab[] = [
  { id: 'home', label: 'Home' },
  { id: 'explore', label: 'Explore' },
  { id: 'profile', label: 'Profile' },
];

const manyTabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'movies', label: 'Movies' },
  { id: 'series', label: 'TV Series' },
  { id: 'sports', label: 'Sports' },
  { id: 'news', label: 'News' },
  { id: 'kids', label: 'Kids' },
  { id: 'documentaries', label: 'Documentaries' },
];

export const Primary: Story = {
  args: {
    tabs: defaultTabs,
    activeTab: 'home',
    variant: 'primary',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const Secondary: Story = {
  args: {
    tabs: defaultTabs,
    activeTab: 'explore',
    variant: 'secondary',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'login', label: 'Login' },
      { id: 'signup', label: 'Sign Up' },
    ],
    activeTab: 'login',
    variant: 'primary',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const ManyTabsScrollable: Story = {
  args: {
    tabs: manyTabs,
    activeTab: 'all',
    variant: 'primary',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const SingleTab: Story = {
  args: {
    tabs: [{ id: 'only', label: 'Dashboard' }],
    activeTab: 'only',
    variant: 'primary',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};
