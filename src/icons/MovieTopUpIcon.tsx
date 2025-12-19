import Svg, {
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Rect,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const MovieTopUpIcon = ({
  color,
  width = 84,
  height = 120,
  ...props
}: SvgProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 84 120"
    {...props}
  >
    <Path fill="url(#a)" d="M0 0h84v120H0z" />
    <Mask
      id="b"
      width={84}
      height={120}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <Path fill="#3053B7" d="M0 0h84v120H0z" />
    </Mask>
    <G fill="#fff" fillOpacity={0.1} mask="url(#b)">
      <Rect
        width={72.764}
        height={133.477}
        x={58.441}
        y={-0.019}
        rx={20.094}
        transform="rotate(8.913 58.44 -.019)"
      />
      <Rect
        width={71.637}
        height={140.226}
        x={24}
        y={-8.88}
        rx={20.094}
        transform="rotate(-6.508 24 -8.88)"
      />
      <Rect
        width={71.637}
        height={140.226}
        x={94.537}
        y={-2.373}
        rx={20.094}
        transform="rotate(25.1 94.537 -2.373)"
      />
    </G>
    <Path
      fill="#fff"
      fillRule="evenodd"
      d="M40.583 60.384V46.875h4.834v13.51h8.458L43 71.258 32.125 60.384h8.458ZM43 83.125c-8 0-14.5-6.5-14.5-14.5h4.833A9.664 9.664 0 0 0 43 78.292a9.664 9.664 0 0 0 9.667-9.667H57.5c0 8-6.5 14.5-14.5 14.5Z"
      clipRule="evenodd"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={-24.316}
        x2={122.135}
        y1={-127.5}
        y2={-108.774}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
    </Defs>
  </Svg>
);
