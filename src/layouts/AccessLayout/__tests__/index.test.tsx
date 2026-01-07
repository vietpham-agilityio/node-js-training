import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { AccessLayout } from '..';

jest.mock('uniwind', () => ({
  withUniwind: (Component: any) => (props: any) => <Component {...props} />,
  useResolveClassNames: () => 'style',
}));

describe('AccessLayout', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <AccessLayout mode="signin">
        <Text>Child Component</Text>
      </AccessLayout>,
    );
    expect(getByText('Child Component')).toBeTruthy();
  });

  it('displays a loading overlay when loading is true', () => {
    const { getByLabelText } = render(
      <AccessLayout mode="signin" loading>
        <Text>Child Component</Text>
      </AccessLayout>,
    );
    expect(getByLabelText('Logging you in')).toBeTruthy();
  });

  it('shows correct loading message for signup', () => {
    const { getByText, getByLabelText } = render(
      <AccessLayout mode="signup" loading>
        <Text>Child Component</Text>
      </AccessLayout>,
    );
    expect(getByText('Creating your account')).toBeTruthy();
    expect(getByLabelText('Creating your account')).toBeTruthy();
  });

  it('shows correct loading message for signin', () => {
    const { getByText, getByLabelText } = render(
      <AccessLayout mode="signin" loading>
        <Text>Child Component</Text>
      </AccessLayout>,
    );
    expect(getByText('Logging you in')).toBeTruthy();
    expect(getByLabelText('Logging you in')).toBeTruthy();
  });

  it('renders without loading overlay when loading is false', () => {
    const { queryByLabelText } = render(
      <AccessLayout mode="signin" loading={false}>
        <Text>Child Component</Text>
      </AccessLayout>,
    );
    expect(queryByLabelText('Logging you in')).toBeNull();
  });
});
