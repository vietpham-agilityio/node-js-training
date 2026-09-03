import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Components
import { ConfirmationState } from '..';

// Icons
import { CancelIcon } from '@/icons/CancelIcon';
import { TicketCheckedIcon } from '@/icons/TicketCheckedIcon';

describe('ConfirmationState Component', () => {
  const defaultProps = {
    icon: TicketCheckedIcon,
    title: 'Test Title',
    description: 'Test Description',
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<ConfirmationState {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should display the title', () => {
      render(<ConfirmationState {...defaultProps} />);
      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should display the description', () => {
      render(<ConfirmationState {...defaultProps} />);
      expect(screen.getByText('Test Description')).toBeTruthy();
    });

    it('should render the icon', () => {
      render(<ConfirmationState {...defaultProps} />);
      const iconContainer = screen.getByLabelText('confirmation state icon');
      expect(iconContainer).toBeTruthy();
    });
  });

  describe('Content Variations', () => {
    it('should render with different icon', () => {
      const { toJSON } = render(
        <ConfirmationState
          icon={CancelIcon}
          title="Error Title"
          description="Error Description"
        />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render with long title', () => {
      const longTitle =
        'This is a very long title that might wrap to multiple lines';
      render(<ConfirmationState {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it('should render with long description', () => {
      const longDescription =
        'This is a very long description that should wrap properly and remain centered within the maximum width constraint of the component.';
      render(
        <ConfirmationState {...defaultProps} description={longDescription} />,
      );
      expect(screen.getByText(longDescription)).toBeTruthy();
    });

    it('should render with short text', () => {
      render(
        <ConfirmationState
          icon={TicketCheckedIcon}
          title="Done"
          description="Complete."
        />,
      );
      expect(screen.getByText('Done')).toBeTruthy();
      expect(screen.getByText('Complete.')).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot with default props', () => {
      const { toJSON } = render(<ConfirmationState {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
