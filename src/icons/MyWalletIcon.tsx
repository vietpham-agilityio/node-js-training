import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const MyWalletIcon = ({
  color,
  width = 24,
  height = 24,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      fill="url(#a)"
      d="M20.5 7.28V5c0-1.1-.9-2-2-2h-14a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-2.28a2 2 0 0 0 1-1.72V9a2 2 0 0 0-1-1.72Z"
    />
    <Path fill="url(#b)" d="M19.5 9v6h-7V9h7Z" />
    <Path
      fill="#A3BBFF"
      d="M4.5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2h-14Z"
    />
    <Path fill="#A3BBFF" d="M15.5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    <Defs>
      <LinearGradient
        id="a"
        x1={-3}
        x2={29.461}
        y1={-16.125}
        y2={-9.866}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={10.474}
        x2={22.339}
        y1={2.625}
        y2={5.153}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
    </Defs>
  </Svg>
);
