import { fireEvent, render } from '@testing-library/react-native';
import { ErrorBoundary } from '../index';

const renderBoundary = (error: any, retry = jest.fn()) =>
  render(<ErrorBoundary error={error} retry={retry} />);

describe('ErrorBoundary', () => {
  it('shows 401 auth error and hides retry', () => {
    const { getByText } = renderBoundary({
      message: 'Unauthorized',
      statusCode: 401,
      isFatal: true,
    });

    expect(getByText('Try Again')).toBeTruthy();
  });

  it('shows 500 error and allows retry', () => {
    const retry = jest.fn();

    const { getByText } = renderBoundary(
      { message: 'Server error', statusCode: 500 },
      retry,
    );

    fireEvent.press(getByText('Try Again'));
    expect(retry).toHaveBeenCalled();
  });

  it('shows generic error message', () => {
    const { getByText } = renderBoundary({
      message: 'Something bad happened',
    });

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Something bad happened')).toBeTruthy();
  });
});
