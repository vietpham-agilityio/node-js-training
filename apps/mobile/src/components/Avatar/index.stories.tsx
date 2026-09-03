import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Avatar } from './';

const meta: Meta<typeof Avatar> = {
  title: 'Avatar',
  component: Avatar,
  parameters: {
    notes:
      'An avatar component that displays a profile picture with customizable sizes and variants. Supports image picking from gallery, camera capture, and removal in picker mode.',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: [48, 92, 132, 160],
      description: 'Size of the avatar in pixels',
      table: {
        defaultValue: { summary: '92' },
      },
    },
    source: {
      control: { type: 'text' },
      description: 'URI of the image to display',
    },
    accessibilityLabel: {
      control: { type: 'text' },
      description: 'Accessibility label for the avatar',
      table: {
        defaultValue: { summary: 'Profile picture' },
      },
    },
  },
  decorators: [
    Story => (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default avatar without image (size 92)
export const Default: Story = {
  args: {
    size: 92,
    accessibilityLabel: 'User profile picture',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default avatar showing placeholder icon. This variant is read-only and does not allow image selection.',
      },
    },
  },
};

// Small size avatar (48px)
export const Small: Story = {
  args: {
    size: 48,
    accessibilityLabel: 'Small profile picture',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small 48x48 pixel avatar, suitable for compact UI elements.',
      },
    },
  },
};

// Medium size avatar (92px - default)
export const Medium: Story = {
  args: {
    size: 92,
    accessibilityLabel: 'Medium profile picture',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium 92x92 pixel avatar (default size).',
      },
    },
  },
};

// Large size avatar (132px)
export const LargeSize: Story = {
  args: {
    size: 132,
    accessibilityLabel: 'Large profile picture',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large 132x132 pixel avatar.',
      },
    },
  },
};

// Extra large size avatar (160px)
export const ExtraLarge: Story = {
  args: {
    size: 160,
    accessibilityLabel: 'Extra large profile picture',
  },
  parameters: {
    docs: {
      description: {
        story: 'Extra large 160x160 pixel avatar for profile pages.',
      },
    },
  },
};

// Avatar with image source
export const WithImage: Story = {
  args: {
    size: 92,
    source: 'https://i.pravatar.cc/300',
    accessibilityLabel: 'Profile picture with image',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Avatar displaying an actual image from a URI. The image is cropped to fit the circular frame.',
      },
    },
  },
};
