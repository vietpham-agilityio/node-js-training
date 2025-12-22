import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const LogoutIcon = ({ width = 22, height = 22, ...props }: SvgProps) => {
  const { color } = useResolveClassNames('text-text-highlight');

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4.75A1.75 1.75 0 0 1 5.75 3h6.5a.75.75 0 0 1 0 1.5h-6.5A.25.25 0 0 0 5.5 4.75v14.5c0 .138.112.25.25.25h6.5a.75.75 0 0 1 0 1.5h-6.5A1.75 1.75 0 0 1 4 19.25V4.75Zm10.47 3.22a.75.75 0 0 1 1.06 0l3.22 3.22a.75.75 0 0 1 0 1.06l-3.22 3.22a.75.75 0 1 1-1.06-1.06L16.44 13H9.75a.75.75 0 0 1 0-1.5h6.69l-1.97-1.97a.75.75 0 0 1 0-1.06Z"
      />
    </Svg>
  );
};
