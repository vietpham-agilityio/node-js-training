import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const HelpCenterIcon = ({
  color,
  width = 24,
  height = 24,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      fill="url(#a)"
      d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Z"
    />
    <Path
      fill="url(#b)"
      d="M19 11c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V6.3l7-3.11 7 3.11V11Z"
    />
    <Path
      fill="#A3BBFF"
      d="M7.41 11.59 6 13l4 4 8-8-1.41-1.42L10 14.17l-2.59-2.58Z"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={-2.211}
        x2={28.988}
        y1={-22.375}
        y2={-17.712}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={0.947}
        x2={25.25}
        y1={-15.659}
        y2={-12.155}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
    </Defs>
  </Svg>
);
