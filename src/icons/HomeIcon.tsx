import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const HomeIcon = ({
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
        d="M2 19.626v-8.334c0-1.198.52-2.338 1.424-3.123l6.768-5.877c1.037-.9 2.579-.9 3.616 0l6.768 5.877A4.136 4.136 0 0 1 22 11.292v8.334a2.758 2.758 0 0 1-2.758 2.757h-2.399a1.379 1.379 0 0 1-1.379-1.378v-3.75c0-.761-.617-1.378-1.378-1.378h-3.947c-.761 0-1.378.617-1.378 1.378v3.75c0 .761-.618 1.378-1.38 1.378H4.759A2.758 2.758 0 0 1 2 19.626Z"
      />
    </Svg>
  );
};
