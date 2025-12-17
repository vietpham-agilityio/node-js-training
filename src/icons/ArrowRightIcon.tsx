import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const ArrowRightIcon = ({
  color,
  width = 22,
  height = 22,
  ...props
}: SvgProps) => {
  const { color: baseColor } = useResolveClassNames('text-text-white');

  return (
    <Svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 22 22"
      {...props}
    >
      <Path
        fill={color || baseColor}
        d="m10.667 0-1.88 1.88 7.44 7.453H0V12h16.227l-7.44 7.453 1.88 1.88 10.666-10.666L10.667 0Z"
      />
    </Svg>
  );
};
