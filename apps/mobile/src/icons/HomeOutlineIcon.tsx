import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const HomeOutlineIcon = ({
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
        stroke={color || baseColor}
        strokeLinejoin="round"
        strokeWidth={1.861}
        d="M3 19.266v-7.5c0-1.08.467-2.105 1.282-2.812l6.09-5.289a2.482 2.482 0 0 1 3.255 0l6.091 5.29A3.723 3.723 0 0 1 21 11.764v7.501a2.482 2.482 0 0 1-2.482 2.482H16.36a1.24 1.24 0 0 1-1.24-1.241v-3.375a1.24 1.24 0 0 0-1.242-1.24h-3.552a1.24 1.24 0 0 0-1.24 1.24v3.375a1.24 1.24 0 0 1-1.241 1.24H5.482A2.482 2.482 0 0 1 3 19.267Z"
      />
    </Svg>
  );
};
