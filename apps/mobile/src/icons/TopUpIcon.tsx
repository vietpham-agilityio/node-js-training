import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const TopUpIcon = ({
  color,
  width = 26,
  height = 26,
  ...props
}: SvgProps) => {
  const { color: baseColor } = useResolveClassNames('text-text-white');

  return (
    <Svg
      testID="top-up-icon"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 26 26"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9167 10.9308V4.875H14.0833V10.9308H17.875L13 15.8058L8.125 10.9308H11.9167ZM13 21.125C9.41417 21.125 6.5 18.2108 6.5 14.625H8.66667C8.66667 17.0192 10.6058 18.9583 13 18.9583C15.3942 18.9583 17.3333 17.0192 17.3333 14.625H19.5C19.5 18.2108 16.5858 21.125 13 21.125Z"
        fill={color || baseColor}
      />
    </Svg>
  );
};
