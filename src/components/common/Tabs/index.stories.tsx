import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

// Components
import { Tabs } from '../index';

// Types
interface Tab {
  id: string;
  label: string;
}

const meta: Meta<typeof Tabs> = {
  title: 'common/Tabs',
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

export const LongLabels: Story = {
  args: {
    tabs: [
      { id: '1', label: 'Getting Started' },
      { id: '2', label: 'Documentation' },
      { id: '3', label: 'Advanced Features' },
    ],
    activeTab: '1',
    variant: 'secondary',
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

// Interactive component wrappers
const InteractivePrimaryComponent = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View className="w-full h-full p-4 bg-dark-blue">
      <Tabs
        tabs={defaultTabs}
        activeTab={activeTab}
        variant="primary"
        onTabChange={setActiveTab}
      />
    </View>
  );
};

const InteractiveSecondaryComponent = () => {
  const [activeTab, setActiveTab] = useState('movies');

  return (
    <View className="w-full h-full p-4 bg-dark-blue">
      <Tabs
        tabs={manyTabs}
        activeTab={activeTab}
        variant="secondary"
        onTabChange={setActiveTab}
      />
    </View>
  );
};

const BothVariantsComponent = () => {
  const [primaryActiveTab, setPrimaryActiveTab] = useState('home');
  const [secondaryActiveTab, setSecondaryActiveTab] = useState('explore');

  return (
    <View className="h-full p-4 bg-dark-blue gap-8">
      <View>
        <View className="mb-2">
          <View className="text-white text-sm font-montserrat-semibold">
            Primary Variant
          </View>
        </View>
        <Tabs
          tabs={defaultTabs}
          activeTab={primaryActiveTab}
          variant="primary"
          onTabChange={setPrimaryActiveTab}
        />
      </View>

      <View>
        <View className="mb-2">
          <View className="text-white text-sm font-montserrat-semibold">
            Secondary Variant
          </View>
        </View>
        <Tabs
          tabs={defaultTabs}
          activeTab={secondaryActiveTab}
          variant="secondary"
          onTabChange={setSecondaryActiveTab}
        />
      </View>
    </View>
  );
};

const DifferentTabCountsComponent = () => {
  const [tab2Active, setTab2Active] = useState('login');
  const [tab3Active, setTab3Active] = useState('home');
  const [tab5Active, setTab5Active] = useState('all');

  const twoTabs: Tab[] = [
    { id: 'login', label: 'Login' },
    { id: 'signup', label: 'Sign Up' },
  ];

  const threeTabs: Tab[] = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'profile', label: 'Profile' },
  ];

  const fiveTabs: Tab[] = [
    { id: 'all', label: 'All' },
    { id: 'movies', label: 'Movies' },
    { id: 'series', label: 'TV Series' },
    { id: 'sports', label: 'Sports' },
    { id: 'news', label: 'News' },
  ];

  return (
    <View className="h-full p-4 bg-dark-blue gap-6">
      <View>
        <View className="mb-2 text-white text-xs font-montserrat-medium opacity-70">
          2 Tabs - Primary
        </View>
        <Tabs
          tabs={twoTabs}
          activeTab={tab2Active}
          variant="primary"
          onTabChange={setTab2Active}
        />
      </View>

      <View>
        <View className="mb-2 text-white text-xs font-montserrat-medium opacity-70">
          3 Tabs - Secondary
        </View>
        <Tabs
          tabs={threeTabs}
          activeTab={tab3Active}
          variant="secondary"
          onTabChange={setTab3Active}
        />
      </View>

      <View>
        <View className="mb-2 text-white text-xs font-montserrat-medium opacity-70">
          5 Tabs - Primary (Scrollable)
        </View>
        <Tabs
          tabs={fiveTabs}
          activeTab={tab5Active}
          variant="primary"
          onTabChange={setTab5Active}
        />
      </View>
    </View>
  );
};

const RealWorldExampleComponent = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const movieTabs: Tab[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'now-playing', label: 'Now Playing' },
    { id: 'popular', label: 'Popular' },
    { id: 'top-rated', label: 'Top Rated' },
  ];

  return (
    <View className="h-full bg-dark-blue">
      <View className="p-4">
        <View className="text-white text-2xl font-montserrat-bold mb-4">
          Movies
        </View>
        <Tabs
          tabs={movieTabs}
          activeTab={activeTab}
          variant="secondary"
          onTabChange={setActiveTab}
        />
      </View>
      <View className="flex-1 items-center justify-center">
        <View className="text-white text-base font-montserrat-medium">
          {movieTabs.find(t => t.id === activeTab)?.label} Content
        </View>
      </View>
    </View>
  );
};

export const InteractivePrimary: Story = {
  render: () => <InteractivePrimaryComponent />,
};

export const InteractiveSecondary: Story = {
  render: () => <InteractiveSecondaryComponent />,
};

export const BothVariants: Story = {
  render: () => <BothVariantsComponent />,
};

export const DifferentTabCounts: Story = {
  render: () => <DifferentTabCountsComponent />,
};

export const RealWorldExample: Story = {
  render: () => <RealWorldExampleComponent />,
};
