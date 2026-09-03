import Svg, { Path, SvgProps } from 'react-native-svg';

export const SearchIcon = ({
  color,
  width = 24,
  height = 24,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" {...props}>
    <Path
      fill={color}
      fillRule="evenodd"
      d="M10.664 1.994C5.87 1.994 2 5.92 2 10.74c0 4.82 3.869 8.746 8.664 8.746 4.796 0 8.665-3.926 8.665-8.746 0-2.317-.91-4.54-2.534-6.181a8.624 8.624 0 0 0-6.13-2.566ZM4.09 10.74c0-3.687 2.954-6.657 6.574-6.657 1.74 0 3.412.699 4.645 1.946a6.699 6.699 0 0 1 1.93 4.71c0 3.687-2.954 6.657-6.575 6.657-3.62 0-6.574-2.97-6.574-6.656Zm15.02 6.898a1.045 1.045 0 1 0-1.477 1.478l2.583 2.583a1.045 1.045 0 1 0 1.478-1.478l-2.583-2.583Z"
      clipRule="evenodd"
    />
  </Svg>
);
