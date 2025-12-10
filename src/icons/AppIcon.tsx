import * as React from 'react';
import { ColorValue } from 'react-native';

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

export const AppIcon = ({
  color,
  stopColor,
  width = 144,
  height = 144,

  ...props
}: SvgProps & { stopColor?: ColorValue }) => {
  // Calculate scale factor based on the base size of 144
  const scale = (width as number) / 144;

  // Helper function to scale values
  const s = (value: number) => (value as number) * scale;

  return (
    <Svg width={width} height={height} fill="none" {...props}>
      <G clipPath="url(#a)">
        <Rect width={width} height={height} fill="url(#b)" rx={s(32)} />
        <Circle
          cx={s(6.967)}
          cy={s(20.903)}
          r={s(123.097)}
          fill={color}
          fillOpacity={0.04}
        />
        <G clipPath="url(#c)">
          <Path
            fill={color}
            d={`M${s(105.291)} ${s(72)}c0-${s(18.386)}-${s(14.905)}-${s(33.29)}-${s(33.29)}-${s(33.29)}C${s(53.613)} ${s(38.71)} ${s(38.71)} ${s(53.614)} ${s(38.71)} ${s(72)}S${s(53.614)} ${s(105.29)} ${s(72)} ${s(105.29)}h${s(33.291)}v-${s(5.548)}H${s(90.379)}A${s(33.286)} ${s(33.286)} 0 0 0 ${s(105.291)} ${s(72)}ZM${s(88.307)} ${s(94.444)}a${s(8.324)} ${s(8.324)} 0 0 1-${s(9.784)}-${s(13.467)} ${s(8.322)} ${s(8.322)} 0 0 1 ${s(11.625)} ${s(1.842)} ${s(8.322)} ${s(8.322)} 0 0 1-${s(1.841)} ${s(11.625)}Zm-${s(0.41)}-${s(36.36)}a${s(8.322)} ${s(8.322)} 0 1 1 ${s(5.144)} ${s(15.83)} ${s(8.322)} ${s(8.322)} 0 1 1-${s(5.143)}-${s(15.83)}ZM${s(72)} ${s(44.258)}a${s(8.323)} ${s(8.323)} 0 1 1 0 ${s(16.646)} ${s(8.323)} ${s(8.323)} 0 0 1 0-${s(16.646)}ZM${s(45.616)} ${s(63.427)}a${s(8.324)} ${s(8.324)} 0 0 1 ${s(15.831)} ${s(5.143)} ${s(8.323)} ${s(8.323)} 0 0 1-${s(15.831)}-${s(5.143)}Zm${s(21.703)} ${s(29.175)}a${s(8.322)} ${s(8.322)} 0 1 1-${s(13.466)}-${s(9.783)} ${s(8.322)} ${s(8.322)} 0 0 1 ${s(11.625)}-${s(1.841)} ${s(8.322)} ${s(8.322)} 0 0 1 ${s(1.84)} ${s(11.624)}ZM${s(69.226)} ${s(72)}a${s(2.774)} ${s(2.774)} 0 1 1 ${s(5.549)} 0 ${s(2.774)} ${s(2.774)} 0 0 1-${s(5.549)} 0Z`}
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="a">
          <Rect width={width} height={height} fill={color} rx={s(32)} />
        </ClipPath>
        <ClipPath id="c">
          <Path
            fill={color}
            d={`M${s(38.71)} ${s(38.71)}h${s(66.581)}v${s(66.58)}H${s(38.71)}z`}
          />
        </ClipPath>
        <LinearGradient
          id="b"
          x1={s(-41.684)}
          x2={s(205.24)}
          y1={s(-153)}
          y2={s(-107.897)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={stopColor} />
          <Stop offset={1} stopColor={stopColor} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
