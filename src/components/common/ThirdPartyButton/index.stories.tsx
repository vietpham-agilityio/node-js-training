import type { Meta, StoryObj } from '@storybook/react-native';
import ThirdPartyButton, { ThirdPartyButtonType } from './';

const meta: Meta<typeof ThirdPartyButton> = {
  title: 'ThirdPartyButton',
  component: ThirdPartyButton,
  parameters: {
    notes:
      'A simple third party button component that displays a button with a Facebook or Google icon.',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Facebook: Story = {
  args: {
    type: ThirdPartyButtonType.FACEBOOK,
    onPress: () => {},
  },
};

export const Google: Story = {
  args: {
    type: ThirdPartyButtonType.GOOGLE,
    onPress: () => {},
  },
};
