import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const LockIcon = ({ fill, ...props }: SvgProps) => {
  const { color } = useResolveClassNames('text-text-highlight');

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={fill || color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 10V8a5 5 0 0 1 10 0v2h1.5A1.5 1.5 0 0 1 20 11.5v7A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-7A1.5 1.5 0 0 1 5.5 10H7Zm2-2a3 3 0 1 1 6 0v2H9V8Zm3 4a1.5 1.5 0 0 0-.75 2.799V16a.75.75 0 0 0 1.5 0v-1.201A1.5 1.5 0 0 0 12 12Z"
      />
    </Svg>
  );
};
