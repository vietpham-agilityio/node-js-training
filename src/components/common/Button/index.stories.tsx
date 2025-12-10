import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

// Components
import { Button } from './';

// Constants
import { Size } from '@/constants/enum';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  parameters: {
    notes:
      'A button component with primary and secondary gradient states, featuring size variants (small, medium, large) with different vertical padding. Primary uses blue gradient (#3E60F9 to #3D54F8), secondary uses cyan gradient (#449EFF to #1DC7F7).',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The text displayed on the button',
    },
    isPrimary: {
      control: 'boolean',
      description:
        'Whether the button uses primary (blue) or secondary (cyan) gradient',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description:
        'Button size - small: 10px padding, medium: 12px padding, large: 20px padding',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    onPress: {
      action: 'pressed',
      description: 'Callback function called when button is pressed',
    },
    testID: {
      control: 'text',
      description: 'Test identifier for the button',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Get Started',
    isPrimary: true,
    size: Size.MEDIUM,
    onPress: () => console.log('Button pressed'),
  },
};

export const Secondary: Story = {
  args: {
    title: 'Login',
    isPrimary: false,
    size: Size.MEDIUM,
    onPress: () => console.log('Login pressed'),
  },
};

export const Small: Story = {
  args: {
    title: 'Small Button',
    isPrimary: true,
    size: Size.SMALL,
    onPress: () => console.log('Small button pressed'),
  },
};

export const Medium: Story = {
  args: {
    title: 'Medium Button',
    isPrimary: true,
    size: Size.MEDIUM,
    onPress: () => console.log('Medium button pressed'),
  },
};

export const Large: Story = {
  args: {
    title: 'Large Button',
    isPrimary: true,
    size: Size.LARGE,
    onPress: () => console.log('Large button pressed'),
  },
};

export const Disabled: Story = {
  render: () => (
    <View className="w-full h-full p-4 bg-dark-blue">
      <Button
        title="Login"
        isPrimary={true}
        size={Size.MEDIUM}
        disabled={true}
        onPress={() => console.log('Login pressed')}
      />
    </View>
  ),
};

export const LongText: Story = {
  args: {
    title: 'Create New Account',
    isPrimary: true,
    size: Size.MEDIUM,
    onPress: () => console.log('Button pressed'),
  },
};

export const AllSizes: Story = {
  render: () => (
    <View className="h-full p-4 bg-dark-blue gap-4 items-center">
      <View className="w-28">
        <Button
          title="Action"
          isPrimary={false}
          size={Size.EXTRA_SMALL}
          buttonStyle={{ borderRadius: 10 }}
          onPress={() => console.log('Extra Small pressed')}
        />
      </View>
      <View className="w-30">
        <Button
          title="Book Ticket"
          isPrimary
          buttonStyle={{ borderRadius: 14 }}
          size={Size.SMALL}
          onPress={() => console.log('Small pressed')}
        />
      </View>
      <View className="w-15">
        <Button
          title="Sun 22"
          isPrimary
          size={Size.MEDIUM}
          onPress={() => console.log('Medium pressed')}
        />
      </View>
      <View className="w-70">
        <Button
          title="Sign In"
          disabled
          size={Size.LARGE}
          onPress={() => console.log('Large pressed')}
        />
      </View>
    </View>
  ),
};
