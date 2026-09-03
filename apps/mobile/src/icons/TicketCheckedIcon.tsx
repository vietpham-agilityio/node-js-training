import Svg, {
  Path,
  G,
  Circle,
  Mask,
  Defs,
  LinearGradient,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const TicketCheckedIcon = (props: SvgProps) => (
  <Svg width={176} height={136} viewBox="0 57 176 136" fill="none" {...props}>
    <Path
      fill="#1E3577"
      fillRule="evenodd"
      d="M129.387 70.85H35.381c-5.474 0-9.912 4.438-9.912 9.912v29.413a5.454 5.454 0 0 0 4.33 5.337c5.775 1.217 5.775 9.46 0 10.676a5.456 5.456 0 0 0-4.33 5.338v29.413c0 5.474 4.438 9.911 9.912 9.911h128.088c5.474 0 9.912-4.437 9.912-9.911v-29.413a5.456 5.456 0 0 0-4.331-5.338c-5.774-1.216-5.774-9.459 0-10.676a5.454 5.454 0 0 0 4.331-5.337V96.584c-4.761 5.32-11.68 8.668-19.381 8.668-14.359 0-26-11.64-26-26 0-2.94.488-5.766 1.387-8.402Z"
      clipRule="evenodd"
    />
    <G filter="url(#a)">
      <Circle cx={154} cy={79.252} r={22} fill="url(#b)" />
    </G>
    <Path
      fill="#fff"
      d="M152.605 82.652a3.572 3.572 0 0 1-5.225-.002l-1.66-1.781a1.295 1.295 0 0 0-1.895 1.765l2.43 2.608a5.107 5.107 0 0 0 7.473 0l10.452-11.218a1.29 1.29 0 1 0-1.888-1.76l-9.687 10.388Z"
    />
    <Mask
      id="c"
      width={148}
      height={101}
      x={0}
      y={93}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <Path
        fill="#503E9D"
        fillRule="evenodd"
        d="M34.059 93.252H9.912C4.438 93.252 0 97.69 0 103.163V132.574a5.455 5.455 0 0 0 4.333 5.339c5.777 1.215 5.777 9.463 0 10.678A5.455 5.455 0 0 0 0 153.93V183.34c0 5.474 4.438 9.912 9.912 9.912h128.176c5.474 0 9.912-4.438 9.912-9.912v-29.41a5.455 5.455 0 0 0-4.333-5.339c-5.778-1.215-5.778-9.463 0-10.678a5.455 5.455 0 0 0 4.333-5.339v-29.411c0-5.474-4.438-9.911-9.912-9.911H34.059Z"
        clipRule="evenodd"
      />
    </Mask>
    <G mask="url(#c)">
      <Path
        fill="url(#d)"
        fillRule="evenodd"
        d="M34.059 93.252H9.912C4.438 93.252 0 97.69 0 103.163V132.574a5.455 5.455 0 0 0 4.333 5.339c5.777 1.215 5.777 9.463 0 10.678A5.455 5.455 0 0 0 0 153.93V183.34c0 5.474 4.438 9.912 9.912 9.912h128.176c5.474 0 9.912-4.438 9.912-9.912v-29.41a5.455 5.455 0 0 0-4.333-5.339c-5.778-1.215-5.778-9.463 0-10.678a5.455 5.455 0 0 0 4.333-5.339v-29.411c0-5.474-4.438-9.911-9.912-9.911H34.059Z"
        clipRule="evenodd"
      />
      <Path
        stroke="url(#e)"
        strokeDasharray="10 10"
        strokeLinecap="round"
        strokeWidth={4}
        d="M3.716 143.252h138.711"
      />
    </G>
    <Circle cx={73} cy={143.39} r={22} fill="#080C48" fillOpacity={0.4} />
    <G filter="url(#f)">
      <Path
        fill="url(#g)"
        d="M91 143.252c0 9.941-8.059 18-18 18s-18-8.059-18-18 8.059-18 18-18 18 8.059 18 18Z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="b"
        x1={132}
        x2={186.212}
        y1={60.139}
        y2={84.931}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.017} stopColor="#449EFF" />
        <Stop offset={0.94} stopColor="#1DC7F7" />
      </LinearGradient>
      <LinearGradient
        id="d"
        x1={50.159}
        x2={142.577}
        y1={110.127}
        y2={193.651}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3053B7" />
        <Stop offset={1} stopColor="#283F82" />
      </LinearGradient>
      <LinearGradient
        id="e"
        x1={3.716}
        x2={3.767}
        y1={143.317}
        y2={146.574}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.017} stopColor="#449EFF" />
        <Stop offset={0.94} stopColor="#1DC7F7" />
      </LinearGradient>
      <LinearGradient
        id="g"
        x1={55}
        x2={99.355}
        y1={127.614}
        y2={147.899}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.017} stopColor="#449EFF" />
        <Stop offset={0.94} stopColor="#1DC7F7" />
      </LinearGradient>
    </Defs>
  </Svg>
);
