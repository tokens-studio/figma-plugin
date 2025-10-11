import React from 'react';
import Lottie from 'lottie-react';
import { styled } from '@/stitches.config';

const StyledLottieWrapper = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

interface LottieAnimationProps {
  animationData: object;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

export function LottieAnimation({
  animationData,
  width = 200,
  height = 200,
  loop = true,
  autoplay = true,
  style,
}: LottieAnimationProps) {
  return (
    <StyledLottieWrapper style={style}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width, height }}
      />
    </StyledLottieWrapper>
  );
}

export default LottieAnimation;