import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const PhotoProfileIcon = ({
  color,
  width = 92,
  height = 92,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" viewBox="0 0 92 92" {...props}>
    <Mask
      id="a"
      width={92}
      height={92}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <Circle cx={46} cy={46} r={46} fill="#E2E3ED" />
    </Mask>
    <G mask="url(#a)">
      <Circle cx={46} cy={46} r={46} fill="#CAE4FF" />
      <Circle cx={46} cy={33} r={15} fill="url(#b)" />
      <Path
        fill="url(#c)"
        d="M15 76c0-11.046 8.954-20 20-20h22c11.046 0 20 8.954 20 20v16H15V76Z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="b"
        x1={22.316}
        x2={73.758}
        y1={-13.875}
        y2={-4.478}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
      <LinearGradient
        id="c"
        x1={-2.947}
        x2={97.021}
        y1={17.75}
        y2={49.198}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
    </Defs>
  </Svg>
);
