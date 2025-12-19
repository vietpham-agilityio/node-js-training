import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

// Components
import { SelectBox } from './';

const meta: Meta<typeof SelectBox> = {
  title: 'SelectBox',
  component: SelectBox,
  parameters: {
    notes:
      'A selectable box component with primary and secondary states. Used for selecting options like dates, showtimes, or other choices. Primary state uses secondary background color, secondary state uses dark navy background.',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'The text value displayed in the select box',
    },
    isPrimary: {
      control: 'boolean',
      description:
        'Whether the box uses primary (secondary bg) or secondary (dark navy bg) styling',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select box is disabled',
    },
    onPress: {
      action: 'pressed',
      description: 'Callback function called when select box is pressed',
    },
    testID: {
      control: 'text',
      description: 'Test identifier for the select box',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling',
    },
  },
  decorators: [
    Story => (
      <View className="p-4 bg-dark-blue items-center justify-center h-50">
        <View className="w-18">
          <Story />
        </View>
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    value: '11:00',
    isPrimary: true,
    onPress: () => console.log('SelectBox pressed'),
  },
};

export const Secondary: Story = {
  args: {
    value: '12:30',
    isPrimary: false,
    onPress: () => console.log('SelectBox pressed'),
  },
};

export const Disabled: Story = {
  args: {
    value: '14:00',
    isPrimary: true,
    disabled: true,
    onPress: () => console.log('SelectBox pressed'),
  },
};

export const DateValue: Story = {
  args: {
    value: 'SUN 22',
    isPrimary: true,
    onPress: () => console.log('Date selected'),
  },
};

export const ShowtimeValue: Story = {
  args: {
    value: '16:40',
    isPrimary: true,
    onPress: () => console.log('Showtime selected'),
  },
};

export const WithCustomClassName: Story = {
  args: {
    value: 'Custom',
    isPrimary: true,
    className: 'py-5 px-3',
    onPress: () => console.log('SelectBox pressed'),
  },
};

export const MultipleStates: Story = {
  render: () => (
    <View className="gap-4 w-full">
      <View className="flex-row gap-4">
        <SelectBox
          value="11:00"
          isPrimary={true}
          onPress={() => console.log('11:00 pressed')}
        />
        <SelectBox
          value="12:30"
          isPrimary={false}
          onPress={() => console.log('12:30 pressed')}
        />
        <SelectBox
          value="14:00"
          isPrimary={true}
          disabled={true}
          onPress={() => console.log('14:00 pressed')}
        />
      </View>
      <View className="flex-row gap-4">
        <SelectBox
          value="SUN 22"
          isPrimary={true}
          className="py-5 px-3"
          onPress={() => console.log('SUN 22 pressed')}
        />
        <SelectBox
          value="MON 23"
          isPrimary={false}
          className="py-5 px-3"
          onPress={() => console.log('MON 23 pressed')}
        />
      </View>
    </View>
  ),
};
