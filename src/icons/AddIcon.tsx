import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const AddIcon = ({
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
      viewBox="0 1 24 24"
      {...props}
    >
      <Path
        fill={color || baseColor}
        fillRule="evenodd"
        d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2Zm-1 5v4H7v2h4v4h2v-4h4v-2h-4V7h-2Zm-7 5c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8-8 3.59-8 8Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
