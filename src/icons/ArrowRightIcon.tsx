import Svg, { Path, SvgProps } from 'react-native-svg';

export const ArrowRightIcon = ({
  color,
  width = 22,
  height = 22,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill={color} {...props}>
    <Path
      fill="#fff"
      d="m10.667 0-1.88 1.88 7.44 7.453H0V12h16.227l-7.44 7.453 1.88 1.88 10.666-10.666L10.667 0Z"
    />
  </Svg>
);
