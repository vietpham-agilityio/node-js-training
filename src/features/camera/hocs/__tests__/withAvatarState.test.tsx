import { act, fireEvent, render } from '@testing-library/react-native';
import { Button, Text, View } from 'react-native';
import { AvatarStateInjectedProps, withAvatarState } from '../withAvatarState';

// A simple component to wrap with the HOC for testing
const BaseComponent = ({
  avatarUri,
  setAvatarUri,
  removeAvatar,
  hasAvatar,
}: AvatarStateInjectedProps) => (
  <View>
    <Text testID="avatarUri">{avatarUri}</Text>
    <Text testID="hasAvatar">{String(hasAvatar)}</Text>
    <Button
      title="Set Avatar"
      onPress={() => setAvatarUri && setAvatarUri('new-uri')}
    />
    <Button
      title="Remove Avatar"
      onPress={() => removeAvatar && removeAvatar()}
    />
  </View>
);

describe('withAvatarState HOC', () => {
  const mockOnChangeImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state correctly without initialSource', () => {
    const ComponentWithState = withAvatarState(BaseComponent);
    const { getByTestId } = render(
      <ComponentWithState onChangeImage={mockOnChangeImage} />,
    );

    expect(getByTestId('avatarUri').children).toEqual([]);
    expect(getByTestId('hasAvatar').children).toEqual(['false']);
  });

  it('provides initial state correctly with initialSource', () => {
    const ComponentWithState = withAvatarState(BaseComponent);
    const { getByTestId } = render(
      <ComponentWithState
        initialSource="initial-uri"
        onChangeImage={mockOnChangeImage}
      />,
    );

    expect(getByTestId('avatarUri').children).toEqual(['initial-uri']);
    expect(getByTestId('hasAvatar').children).toEqual(['true']);
  });

  it('updates avatarUri and calls onChangeImage when setAvatarUri is called', () => {
    const ComponentWithState = withAvatarState(BaseComponent);
    const { getByText, getByTestId } = render(
      <ComponentWithState onChangeImage={mockOnChangeImage} />,
    );

    act(() => {
      fireEvent.press(getByText('Set Avatar'));
    });

    expect(getByTestId('avatarUri').children).toEqual(['new-uri']);
    expect(getByTestId('hasAvatar').children).toEqual(['true']);
    expect(mockOnChangeImage).toHaveBeenCalledWith('new-uri');
    expect(mockOnChangeImage).toHaveBeenCalledTimes(1);
  });

  it('clears avatarUri and calls onChangeImage when removeAvatar is called', () => {
    const ComponentWithState = withAvatarState(BaseComponent);
    const { getByText, getByTestId } = render(
      <ComponentWithState
        initialSource="initial-uri"
        onChangeImage={mockOnChangeImage}
      />,
    );

    act(() => {
      fireEvent.press(getByText('Remove Avatar'));
    });

    expect(getByTestId('avatarUri').children).toEqual([]);
    expect(getByTestId('hasAvatar').children).toEqual(['false']);
    expect(mockOnChangeImage).toHaveBeenCalledWith('');
    expect(mockOnChangeImage).toHaveBeenCalledTimes(1);
  });
});
