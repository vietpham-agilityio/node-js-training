import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

// Components
import { SearchInput } from './';

const meta: Meta<typeof SearchInput> = {
  title: 'SearchInput',
  component: SearchInput,
  decorators: [
    Story => (
      <View className="p-4 bg-dark-blue">
        <Story />
      </View>
    ),
  ],
  parameters: {
    notes:
      'A search input component with a search icon on the left side. Features white placeholder text and dark navy background. The component uses theme colors for consistent styling.',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The value of the search input',
    },
    placeholder: {
      control: 'text',
      description: 'The placeholder text for the search input',
    },
    onChangeText: {
      action: 'onChangeText',
      description: 'Callback function called when the text changes',
    },
    testID: {
      control: 'text',
      description: 'Test identifier for the search input',
    },
    containerClassName: {
      control: 'text',
      description: 'Additional className for the container',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {
  args: {
    placeholder: 'Search movie',
    testID: 'search-input',
  },
};

// With Value
export const WithValue: Story = {
  args: {
    placeholder: 'Search movie',
    value: 'Inception',
    testID: 'search-input-value',
  },
};

// Custom Placeholder
export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Search for movies, actors, directors...',
    testID: 'search-input-custom',
  },
};

// Empty State
export const Empty: Story = {
  args: {
    placeholder: 'Search movie',
    value: '',
    testID: 'search-input-empty',
  },
};

// With Container ClassName
export const WithContainerClassName: Story = {
  args: {
    placeholder: 'Search movie',
    containerClassName: 'bg-white p-2',
    testID: 'search-input-container',
  },
};
