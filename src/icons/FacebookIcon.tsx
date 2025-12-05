import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const FacebookIcon = (props: SvgProps) => (
  <Svg width={18} height={32} fill="none" {...props}>
    <Path
      fill="#0075FF"
      d="M12.667 5.333h4a.667.667 0 0 0 .666-.666v-4A.667.667 0 0 0 16.667 0h-4a7.341 7.341 0 0 0-7.334 7.333V12H.667a.667.667 0 0 0-.667.667v4c0 .368.298.666.667.666h4.666v14c0 .369.299.667.667.667h4a.667.667 0 0 0 .667-.667v-14h4.666a.667.667 0 0 0 .632-.456l1.334-4a.667.667 0 0 0-.632-.877h-6V7.333a2 2 0 0 1 2-2Z"
    />
  </Svg>
);

export default FacebookIcon;
