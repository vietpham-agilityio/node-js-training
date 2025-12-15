import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const EyeIcon = ({ fill, ...props }: SvgProps) => {
  const { color } = useResolveClassNames('text-text-white');

  return (
    <Svg
      width={24}
      height={24}
      color={fill || color}
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill={fill || color}
        fillRule="evenodd"
        d="M12 5c-2.11 0-4.006.927-5.509 2.009-1.51 1.087-2.71 2.391-3.45 3.29a2.66 2.66 0 0 0 0 3.402c.74.899 1.94 2.203 3.45 3.29C7.994 18.073 9.891 19 12.001 19s4.005-.927 5.508-2.009c1.511-1.087 2.711-2.391 3.451-3.29a2.66 2.66 0 0 0 0-3.402c-.74-.899-1.94-2.203-3.45-3.29C16.005 5.927 14.11 5 12 5Zm0 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
