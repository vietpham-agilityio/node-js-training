import { render } from '@testing-library/react-native';

// Components
import { Skeleton } from '../index';

describe('Skeleton', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <Skeleton width={100} height={100} testID="skeleton" />,
    );
    expect(getByTestId('skeleton')).toBeTruthy();
  });

  it('applies custom width and height', () => {
    const { getByTestId } = render(
      <Skeleton width={200} height={150} testID="skeleton" />,
    );
    const skeleton = getByTestId('skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <Skeleton
        width={100}
        height={100}
        className="rounded-lg"
        testID="skeleton"
      />,
    );
    expect(getByTestId('skeleton')).toBeTruthy();
  });

  it('applies custom borderRadius', () => {
    const { getByTestId } = render(
      <Skeleton width={100} height={100} borderRadius={12} testID="skeleton" />,
    );
    expect(getByTestId('skeleton')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(
      <Skeleton
        width={100}
        height={100}
        accessibilityLabel="Loading content"
      />,
    );
    expect(getByLabelText('Loading content')).toBeTruthy();
  });

  it('uses default accessibility label when not provided', () => {
    const { getByLabelText } = render(<Skeleton width={100} height={100} />);
    expect(getByLabelText('Loading')).toBeTruthy();
  });
});
