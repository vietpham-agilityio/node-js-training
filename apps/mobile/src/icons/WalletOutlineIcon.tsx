import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const WalletOutlineIcon = ({
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
        strokeWidth={1.923}
        d="M3.127 4.882C2 6.009 2 7.822 2 11.449v1.102c0 3.627 0 5.44 1.127 6.567 1.126 1.127 2.94 1.127 6.566 1.127h4.07c3.626 0 5.44 0 6.566-1.127.486-.486.762-1.1.92-1.931.111-.592.168-.888-.025-1.12-.192-.232-.523-.232-1.184-.232h-3.428a3.526 3.526 0 0 1-3.526-3.527v-.616a3.526 3.526 0 0 1 3.526-3.527h3.428c.661 0 .992 0 1.184-.232.192-.232.136-.528.025-1.12-.158-.832-.434-1.445-.92-1.931-1.127-1.127-2.94-1.127-6.567-1.127H9.694c-3.626 0-5.44 0-6.566 1.127Z"
      />
      <Path
        fill={color || baseColor}
        fillRule="evenodd"
        d="M21.812 10.276c.188.188.188.487.188 1.086V12.637c0 .599 0 .898-.188 1.086-.187.188-.488.188-1.088.188h-3.762c-.92 0-1.666-.718-1.666-1.603v-.617c0-.885.746-1.603 1.666-1.603h3.762c.6 0 .9 0 1.088.188Zm-4.132 2.688a.966.966 0 1 0 0-1.932.966.966 0 0 0 0 1.932Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
