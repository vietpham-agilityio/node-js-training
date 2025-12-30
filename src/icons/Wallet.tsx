import Svg, { Path, SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

export const Wallet = (props: SvgProps) => {
  const { color, width = 24, height = 24 } = props;
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
        fillRule="evenodd"
        d="M1.998 11.433c0-3.729 0-5.593 1.158-6.751C4.316 3.523 6.18 3.523 9.909 3.523h4.184c3.729 0 5.593 0 6.751 1.159.5.5.784 1.13.946 1.985.115.609.172.913-.025 1.152-.198.239-.538.239-1.217.239H17.02a3.625 3.625 0 0 0-3.625 3.625v.634a3.625 3.625 0 0 0 3.625 3.626h3.526c.68 0 1.019 0 1.217.238.197.239.14.543.025 1.152-.162.855-.446 1.486-.946 1.986-1.158 1.158-3.022 1.158-6.751 1.158H9.908c-3.729 0-5.593 0-6.752-1.159-1.158-1.158-1.158-3.022-1.158-6.751v-1.134Zm19.81-1.205c.194.193.194.501.194 1.117v1.31c0 .616 0 .924-.193 1.117-.193.193-.502.193-1.12.193h-3.668c-.91 0-1.647-.738-1.647-1.648v-.634c0-.91.737-1.648 1.647-1.648h3.668c.618 0 .927 0 1.12.193Zm-4.138 2.765a.994.994 0 1 0 0-1.988.994.994 0 0 0 0 1.988Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
