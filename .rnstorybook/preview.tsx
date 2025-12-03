import React from 'react';
import type { Preview } from '@storybook/react-native';
import { ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Constants

const DynamicBackgroundDecorator = (Story: any) => {


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Story />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const preview: Preview = {
  decorators: [DynamicBackgroundDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
