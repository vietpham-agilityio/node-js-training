import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const ChangeLanguageIcon = ({
  color,
  width = 24,
  height = 24,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      fill="#A3BBFF"
      d="m12.87 15.07-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04Z"
    />
    <Path fill="url(#a)" d="M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12Z" />
    <Path fill="#04103A" d="m15.88 17 1.62-4.33L19.12 17h-3.24Z" />
    <Defs>
      <LinearGradient
        id="a"
        x1={8.816}
        x2={27.776}
        y1={-2.75}
        y2={0.425}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
    </Defs>
  </Svg>
);
