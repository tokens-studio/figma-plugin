import React from 'react';
import { keyframes, styled } from '@/stitches.config';

// Colours sampled from the upgrade dialog designs. The illustrations sit on a fixed pink canvas,
// so they don't follow the light/dark theme.
export const colors = {
  canvas: '#FF709C',
  blob: '#F65183',
  ink: '#2F0210',
  shadow: '#DE5E86',
  white: '#FFFFFF',
  surface: '#F7F8F8',
  field: '#E4E1E2',
  fieldSubtle: '#F1EFEF',
  fieldStrong: '#B1AEAF',
  highlight: '#FFF1F5',
  badge: '#FFE8EF',
};

// Every illustration is drawn on the same 16:9 canvas as the dialog media slot.
export const VIEWBOX = '0 0 836 470';
export const STROKE = 3;
const SHADOW_OFFSET = 10;

export const FONT_FAMILY = 'Inter, sans-serif';

export const popIn = keyframes({
  from: { opacity: 0, transform: 'translateY(16px) scale(0.92)' },
  to: { opacity: 1, transform: 'none' },
});

export const float = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-4px)' },
});

// Animated groups transform around their own box, and stay still for people who prefer reduced motion.
export const AnimatedGroup = styled('g', {
  transformBox: 'fill-box',
  transformOrigin: 'center',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none !important',
  },
});

type RaisedProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  fill?: string;
};

// A shape with the designs' signature ink outline and a flat pink shadow down and to the left.
export function Raised({
  x, y, width, height, radius, fill = colors.white,
}: RaisedProps) {
  return (
    <>
      <rect x={x - SHADOW_OFFSET} y={y + SHADOW_OFFSET} width={width} height={height} rx={radius} fill={colors.shadow} />
      <rect x={x} y={y} width={width} height={height} rx={radius} fill={fill} stroke={colors.ink} strokeWidth={STROKE} />
    </>
  );
}

// Tokens Studio mark, drawn in a 16×16 box.
export function TokensStudioMark({
  x, y, size, color,
}: { x: number; y: number; size: number; color: string }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
        d="M6.55705 3.42193C6.73492 2.5413 7.25231 1.93388 7.89695 1.60227C6.4794 0.870877 4.4486 1.48665 4.05769 3.42205C3.85197 4.44056 3.06815 5.2438 2.05499 5.47435C-0.719488 6.10571 -0.670982 10.0749 2.1181 10.6383C3.13658 10.844 3.9398 11.6279 4.17035 12.641C4.60236 14.5396 6.59717 15.1163 7.99426 14.3976C7.36895 14.075 6.86297 13.4902 6.66971 12.6409C6.43917 11.6277 5.63595 10.8439 4.61746 10.6382C1.82839 10.0748 1.77988 6.10559 4.55436 5.47423C5.56751 5.24367 6.35133 4.44044 6.55705 3.42193ZM8.00586 1.60239C9.40295 0.883699 11.3978 1.46041 11.8298 3.35894C12.0603 4.37212 12.8635 5.15596 13.882 5.36169C16.6711 5.92506 16.7196 9.89427 13.9451 10.5256C12.932 10.7562 12.1482 11.5594 11.9424 12.5779C11.5515 14.5133 9.52072 15.1291 8.10317 14.3977C8.74781 14.0661 9.2652 13.4587 9.44307 12.5781C9.64879 11.5595 10.4326 10.7563 11.4458 10.5258C14.2202 9.89439 14.1717 5.92518 11.3827 5.36181C10.3642 5.15609 9.56096 4.37225 9.33041 3.35906C9.13715 2.50979 8.63117 1.92502 8.00586 1.60239Z"
      />
    </svg>
  );
}
