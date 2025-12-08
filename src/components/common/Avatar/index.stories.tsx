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
    variant: {
      control: { type: 'select' },
      options: ['default', 'picker'],
      description:
        'Variant of the avatar - "default" shows static avatar, "picker" allows image selection and removal',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    source: {
      control: { type: 'text' },
      description: 'URI of the image to display',
    },
    onChangeImage: {
      action: 'onChangeImage',
      description:
        'Callback function called when image is selected or removed. Receives the image URI as parameter (empty string when removed).',
    },
    accessibilityLabel: {
      control: { type: 'text' },
      description: 'Accessibility label for the avatar',
      table: {
        defaultValue: { summary: 'Profile picture' },
      },
    },
    accessibilityHint: {
      control: { type: 'text' },
      description: 'Accessibility hint for the picker button',
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
    variant: 'default',
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
    variant: 'default',
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
    variant: 'default',
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
    variant: 'default',
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
    variant: 'default',
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
    variant: 'default',
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

// Picker variant without image (allows adding)
export const PickerEmpty: Story = {
  args: {
    size: 92,
    variant: 'picker',
    onChangeImage: (uri: string) => {
      console.log('Image selected:', uri);
    },
    accessibilityLabel: 'Profile picture picker',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Picker variant without an image. Displays an add button that opens a modal with options to take a photo or choose from gallery.',
      },
    },
  },
};

// Picker variant with image (allows removing)
export const PickerWithImage: Story = {
  args: {
    size: 132,
    variant: 'picker',
    source: 'https://i.pravatar.cc/300?img=1',
    onChangeImage: (uri: string) => {
      console.log('Image changed:', uri);
    },
    accessibilityLabel: 'Profile picture with remove option',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Picker variant with an existing image. Displays a remove button (red X) that clears the image when pressed.',
      },
    },
  },
};

// Custom accessibility
export const CustomAccessibility: Story = {
  args: {
    size: 92,
    variant: 'picker',
    accessibilityLabel: 'Team member avatar',
    accessibilityHint: 'Double tap to change team member photo',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Avatar with custom accessibility labels and hints for better screen reader support.',
      },
    },
  },
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
      <View style={{ alignItems: 'center' }}>
        <Avatar size={48} variant="default" />
        <View style={{ marginTop: 8 }}>48px</View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Avatar size={92} variant="default" />
        <View style={{ marginTop: 8 }}>92px</View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Avatar size={132} variant="default" />
        <View style={{ marginTop: 8 }}>132px</View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Avatar size={160} variant="default" />
        <View style={{ marginTop: 8 }}>160px</View>
      </View>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available avatar sizes.',
      },
    },
  },
};

// Picker variants comparison
export const PickerVariants: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 30, flexWrap: 'wrap' }}>
      <View style={{ alignItems: 'center' }}>
        <Avatar
          size={92}
          variant="picker"
          onChangeImage={uri => console.log('Image 1:', uri)}
        />
        <View style={{ marginTop: 8 }}>Empty</View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Avatar
          size={92}
          variant="picker"
          source="https://i.pravatar.cc/300?img=2"
          onChangeImage={uri => console.log('Image 2:', uri)}
        />
        <View style={{ marginTop: 8 }}>With Image</View>
      </View>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comparison of picker variant states: empty (with add button) and with image (with remove button).',
      },
    },
  },
};

// Different variants comparison
export const VariantComparison: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 30, flexWrap: 'wrap' }}>
      <View style={{ alignItems: 'center' }}>
        <Avatar
          size={92}
          variant="default"
          source="https://i.pravatar.cc/300?img=3"
        />
        <View style={{ marginTop: 8 }}>Default</View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Avatar
          size={92}
          variant="picker"
          source="https://i.pravatar.cc/300?img=3"
          onChangeImage={uri => console.log('Image changed:', uri)}
        />
        <View style={{ marginTop: 8 }}>Picker</View>
      </View>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comparison of default and picker variants with the same image source. Note the picker variant has a remove button.',
      },
    },
  },
};

// Interactive demo
export const InteractiveDemo: Story = {
  args: {
    size: 132,
    variant: 'picker',
    source: 'https://i.pravatar.cc/300?img=5',
    onChangeImage: (uri: string) => {
      console.log('Image changed to:', uri || 'removed');
    },
    accessibilityLabel: 'Interactive avatar demo',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo where you can test the image picker functionality. Check the console for onChangeImage callbacks.',
      },
    },
  },
};
