import Svg, { Path, SvgProps } from 'react-native-svg';

export const PlayIcon = ({
  color,
  width = 24,
  height = 24,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" viewBox="0 0 16 16" {...props}>
    <Path
      fill={color || '#fff'}
      d="M13 6.268c1.333.77 1.333 2.694 0 3.464l-6 3.464c-1.333.77-3-.192-3-1.732V4.536c0-1.54 1.667-2.502 3-1.732l6 3.464Z"
    />
  </Svg>
);
