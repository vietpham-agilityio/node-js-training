import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const LikeIcon = ({
  color,
  width = 24,
  height = 24,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      fill="url(#a)"
      d="M9 22h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.58 8.59C7.22 8.95 7 9.45 7 10v10c0 1.1.9 2 2 2Z"
    />
    <Path fill="url(#b)" d="m9 10 4.34-4.34L12 11h9v2l-3 7H9V10Z" />
    <Path fill="#A3BBFF" d="M1 10h4v12H1V10Z" />
    <Defs>
      <LinearGradient
        id="a"
        x1={2.368}
        x2={30.127}
        y1={-19.25}
        y2={-15.194}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={5.526}
        x2={26.304}
        y1={-9.576}
        y2={-6.4}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
    </Defs>
  </Svg>
);
