import * as React from 'react';
import Svg, {
  G,
  Rect,
  Circle,
  Path,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  SvgProps,
} from 'react-native-svg';

export const AppIcon = (props: SvgProps) => (
  <Svg width={144} height={144} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Rect width={144} height={144} fill="url(#b)" rx={32} />
      <Circle
        cx={6.967}
        cy={20.903}
        r={123.097}
        fill="#fff"
        fillOpacity={0.04}
      />
      <G clipPath="url(#c)">
        <Path
          fill="#fff"
          d="M105.291 72c0-18.386-14.905-33.29-33.29-33.29C53.613 38.71 38.71 53.614 38.71 72S53.614 105.29 72 105.29h33.291v-5.548H90.379A33.286 33.286 0 0 0 105.291 72ZM88.307 94.444a8.324 8.324 0 0 1-9.784-13.467 8.322 8.322 0 0 1 11.625 1.842 8.322 8.322 0 0 1-1.841 11.625Zm-.41-36.36a8.322 8.322 0 1 1 5.144 15.83 8.322 8.322 0 1 1-5.143-15.83ZM72 44.258a8.323 8.323 0 1 1 0 16.646 8.323 8.323 0 0 1 0-16.646ZM45.616 63.427a8.324 8.324 0 0 1 15.831 5.143 8.323 8.323 0 0 1-15.831-5.143Zm21.703 29.175a8.322 8.322 0 1 1-13.466-9.783 8.322 8.322 0 0 1 11.625-1.841 8.322 8.322 0 0 1 1.84 11.624ZM69.226 72a2.774 2.774 0 1 1 5.549 0 2.774 2.774 0 0 1-5.549 0Z"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="a">
        <Rect width={144} height={144} fill="#fff" rx={32} />
      </ClipPath>
      <ClipPath id="c">
        <Path fill="#fff" d="M38.71 38.71h66.581v66.58H38.71z" />
      </ClipPath>
      <LinearGradient
        id="b"
        x1={-41.684}
        x2={205.24}
        y1={-153}
        y2={-107.897}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3E60F9" />
        <Stop offset={1} stopColor="#3D54F8" />
      </LinearGradient>
    </Defs>
  </Svg>
);
