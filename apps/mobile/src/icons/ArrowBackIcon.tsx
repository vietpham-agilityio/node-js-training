import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const ArrowBackIcon = ({
  color,
  width = 24,
  height = 24,
  ...props
}: SvgProps) => {
  const { color: baseColor } = useResolveClassNames('text-text-white');

  return (
    <Svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill={color || baseColor}
        d="m10 0 1.762 1.762L4.787 8.75H20v2.5H4.787l6.975 6.988L10 20 0 10 10 0Z"
      />
    </Svg>
  );
};
