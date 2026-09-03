import type { Meta, StoryObj } from '@storybook/react-native';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useLoadingStore } from '@/stores/loading';
import { Loading } from '.';

const meta: Meta<typeof Loading> = {
  title: 'Loading',
  component: Loading,
  decorators: [
    Story => (
      <View className="flex-1 bg-bg-primary">
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const Template = () => {
  const { showLoading, hideLoading } = useLoadingStore();

  useEffect(() => {
    showLoading('Loading, please wait...');
    const timer = setTimeout(() => hideLoading(), 2000);
    return () => clearTimeout(timer);
  }, [hideLoading, showLoading]);

  return <Loading />;
};

export const Default: Story = {
  render: () => <Template />,
};

export const Overlay: Story = {
  render: Template,
};
