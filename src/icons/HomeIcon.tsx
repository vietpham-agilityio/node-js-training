import Svg, { Path, SvgProps } from 'react-native-svg';

export const HomeIcon = ({
  color,
  width = 20,
  height = 21,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" {...props}>
    <Path
      fill={color}
      d="M0 18.01V9.674c0-1.198.52-2.337 1.424-3.123L8.192.675c1.037-.9 2.579-.9 3.616 0l6.768 5.877A4.136 4.136 0 0 1 20 9.675v8.334a2.757 2.757 0 0 1-2.758 2.758h-2.399a1.379 1.379 0 0 1-1.379-1.38V15.64c0-.762-.617-1.38-1.378-1.38H8.139c-.761 0-1.378.618-1.378 1.38v3.749c0 .761-.618 1.379-1.38 1.379H2.759A2.757 2.757 0 0 1 0 18.009Z"
    />
  </Svg>
);
