import Svg, { Path, SvgProps } from 'react-native-svg';

export const ChevronDownIcon = ({
  color,
  width = 16,
  height = 10,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m1 1 7 8 7-8"
    />
  </Svg>
);
