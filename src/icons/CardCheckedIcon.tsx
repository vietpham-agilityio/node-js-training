import Svg, {
  Path,
  Circle,
  Mask,
  Rect,
  G,
  Ellipse,
  Defs,
  LinearGradient,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const CardCheckedIcon = (props: SvgProps) => (
  <Svg width={171} height={133} fill="none" {...props}>
    <Path
      fill="#1E3577"
      fillRule="evenodd"
      d="M167 38.33A24.912 24.912 0 0 1 150 45c-13.134 0-23.902-10.128-24.921-23H24c-8.284 0-15 6.716-15 15v64c0 8.284 6.716 15 15 15h128c8.284 0 15-6.716 15-15V38.33Z"
      clipRule="evenodd"
    />
    <Circle cx={150} cy={21} r={21} fill="url(#a)" />
    <Mask
      id="b"
      width={158}
      height={95}
      x={0}
      y={38}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <Rect width={158} height={94} y={38.124} fill="#503E9D" rx={15} />
    </Mask>
    <G mask="url(#b)">
      <Rect width={158} height={94} y={38.124} fill="#2C4BA1" rx={15} />
      <Path fill="url(#c)" d="M162 126-4 37.796V32h166v94Z" />
    </G>
    <Ellipse
      cx={17}
      cy={57.998}
      fill="url(#d)"
      fillOpacity={0.6}
      rx={5}
      ry={4.997}
    />
    <Circle cx={34} cy={58} r={8} fill="url(#e)" />
    <Path
      stroke="url(#f)"
      strokeLinecap="round"
      strokeWidth={4}
      d="M12 104h38"
    />
    <Path
      stroke="url(#g)"
      strokeLinecap="round"
      strokeWidth={4}
      d="M12 113h84"
    />
    <Path
      fill="#fff"
      d="M149.731 24.133a3.28 3.28 0 0 1-4.749-.001l-1.527-1.602a1.165 1.165 0 0 0-1.687 1.607l2.263 2.373c1.81 1.9 4.84 1.9 6.65 0l9.556-10.027a1.161 1.161 0 0 0-1.681-1.602l-8.825 9.252Z"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={129}
        x2={180.748}
        y1={2.756}
        y2={26.421}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.017} stopColor="#449EFF" />
        <Stop offset={0.94} stopColor="#1DC7F7" />
      </LinearGradient>
      <LinearGradient
        id="c"
        x1={3.327}
        x2={142.153}
        y1={40.569}
        y2={108.643}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#2B4797" />
        <Stop offset={1} stopColor="#3053B6" />
      </LinearGradient>
      <LinearGradient
        id="d"
        x1={9.105}
        x2={26.252}
        y1={42.38}
        y2={45.514}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#449EFF" />
        <Stop offset={0.888} stopColor="#1DC7F7" />
      </LinearGradient>
      <LinearGradient
        id="e"
        x1={26}
        x2={45.713}
        y1={51.05}
        y2={60.065}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.017} stopColor="#449EFF" />
        <Stop offset={0.94} stopColor="#1DC7F7" />
      </LinearGradient>
      <LinearGradient
        id="f"
        x1={12}
        x2={12.187}
        y1={104.066}
        y2={107.312}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.017} stopColor="#449EFF" />
        <Stop offset={0.94} stopColor="#1DC7F7" />
      </LinearGradient>
      <LinearGradient
        id="g"
        x1={12}
        x2={12.085}
        y1={113.066}
        y2={116.321}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.017} stopColor="#449EFF" />
        <Stop offset={0.94} stopColor="#1DC7F7" />
      </LinearGradient>
    </Defs>
  </Svg>
);
