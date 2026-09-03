import type { Meta, StoryObj } from '@storybook/react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastType } from '@/constants';
import { useToastStore } from '@/stores/toast';
import { Toast } from '.';

const meta: Meta<typeof Toast> = {
  title: 'Toast',
  component: Toast,
  decorators: [
    Story => (
      <SafeAreaProvider>
        <View className="flex-1 bg-bg-primary">
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const DefaultToast = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToastStore();

  useEffect(() => {
    showSuccess('Saved successfully');
    showError('Something went wrong');
    showWarning('Check your inputs');
    showInfo('This is an info toast');
  }, [showError, showInfo, showSuccess, showWarning]);

  return <Toast />;
};

export const VariousToasts: Story = {
  render: DefaultToast,
};

const ToastWithAction = () => {
  const { showWithAction } = useToastStore();

  useEffect(() => {
    showWithAction('Undo last action?', ToastType.INFO, {
      label: 'Undo',
      onPress: () => {},
    });
  }, [showWithAction]);

  return <Toast />;
};

export const WithAction: Story = {
  render: ToastWithAction,
};
