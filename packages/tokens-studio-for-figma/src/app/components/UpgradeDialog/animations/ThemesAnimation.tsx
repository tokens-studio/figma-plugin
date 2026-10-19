import React from 'react';
import { keyframes, styled } from '@/stitches.config';
import {
  AnimatedGroup, colors, FONT_FAMILY, STROKE, VIEWBOX,
} from './shared';

// The dropdown switches between Light and Dark, and the sample UI on the left switches theme with it.
const CYCLE = '6s ease-in-out infinite';
const ROW_GAP = 52;

const darkSurface = '#4A1F2D';
const darkField = '#5E3241';
const darkFieldStrong = '#7A4C5B';

const selectRow = keyframes({
  '0%, 42%, 100%': { transform: 'translateY(0)' },
  '50%, 92%': { transform: `translateY(${ROW_GAP}px)` },
});

const showWhenLight = keyframes({
  '0%, 42%, 100%': { opacity: 1 },
  '50%, 92%': { opacity: 0 },
});

const showWhenDark = keyframes({
  '0%, 42%, 100%': { opacity: 0 },
  '50%, 92%': { opacity: 1 },
});

const themedFill = (light: string, dark: string) => keyframes({
  '0%, 42%, 100%': { fill: light },
  '50%, 92%': { fill: dark },
});

const panelFill = themedFill(colors.white, colors.ink);
const fieldFill = themedFill(colors.field, darkField);
const subtleFill = themedFill(colors.fieldSubtle, darkSurface);
const strongFill = themedFill(colors.fieldStrong, darkFieldStrong);
const inputFill = themedFill(colors.white, colors.ink);
const inputStroke = keyframes({
  '0%, 42%, 100%': { stroke: colors.field },
  '50%, 92%': { stroke: darkField },
});

const reducedMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none !important' } };
const Panel = styled('rect', { animation: `${panelFill} ${CYCLE}`, ...reducedMotion });
const Field = styled('rect', { animation: `${fieldFill} ${CYCLE}`, ...reducedMotion });
const Subtle = styled('rect', { animation: `${subtleFill} ${CYCLE}`, ...reducedMotion });
const Strong = styled('rect', { animation: `${strongFill} ${CYCLE}`, ...reducedMotion });
const Input = styled('rect', { animation: `${inputFill} ${CYCLE}, ${inputStroke} ${CYCLE}`, ...reducedMotion });

function Chip({ x, y }: { x: number; y: number }) {
  return (
    <>
      <Field x={x} y={y} width="175" height="44" rx="22" fill={colors.field} />
      <Strong x={x + 10} y={y + 9} width="26" height="26" rx="7" fill={colors.fieldStrong} />
      <rect x={x + 50} y={y + 18} width="75" height="8" rx="4" fill={colors.white} />
      <path d={`M${x + 142} ${y + 16}l12 12m0-12-12 12`} stroke={colors.fieldStrong} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export default function ThemesAnimation(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" fontFamily={FONT_FAMILY} {...props}>
      <rect width="836" height="470" fill={colors.canvas} />
      <circle cx="836" cy="0" r="96" fill={colors.blob} />
      <path d="M590 340C640 250 660 170 730 130C780 105 836 110 836 110V470H700C680 420 640 380 590 340Z" fill={colors.blob} />

      {/* Sample UI that follows the selected theme */}
      <rect x="24" y="44" width="436" height="460" rx="24" fill={colors.shadow} />
      <Panel x="34" y="34" width="436" height="460" rx="24" fill={colors.white} stroke={colors.ink} strokeWidth={STROKE} />
      <Field x="68" y="68" width="258" height="22" rx="11" fill={colors.field} />
      <Subtle x="68" y="118" width="368" height="18" rx="9" fill={colors.fieldSubtle} />
      <Subtle x="68" y="154" width="295" height="18" rx="9" fill={colors.fieldSubtle} />
      <Input x="69.5" y="211.5" width="365" height="59" rx="14" fill={colors.white} stroke={colors.field} strokeWidth={STROKE} />
      <Field x="104" y="237" width="295" height="9" rx="4.5" fill={colors.field} />
      <Field x="68" y="290" width="368" height="64" rx="14" fill={colors.field} />
      <rect x="104" y="318" width="272" height="9" rx="4.5" fill={colors.white} />
      <path d="M397 318l6 6 6-6" stroke={colors.fieldStrong} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Chip x={68} y={390} />
      <Chip x={256} y={390} />
      <Chip x={68} y={450} />

      {/* Theme dropdown trigger */}
      <rect x="513" y="143" width="274" height="53" rx="14" fill={colors.white} stroke={colors.ink} strokeWidth={STROKE} />
      <text x="536" y="177" fontSize="19" fill="#6B4652">Theme:</text>
      <AnimatedGroup css={{ animation: `${showWhenLight} ${CYCLE}` }}>
        <text x="614" y="177" fontSize="19" fontWeight="500" fill={colors.ink}>Light</text>
      </AnimatedGroup>
      <AnimatedGroup css={{ animation: `${showWhenDark} ${CYCLE}` }} opacity="0">
        <text x="614" y="177" fontSize="19" fontWeight="500" fill={colors.ink}>Dark</text>
      </AnimatedGroup>
      <path d="M747 167l5 5 5-5" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Open menu */}
      <rect x="503" y="217" width="274" height="121" rx="18" fill={colors.shadow} />
      <rect x="513" y="207" width="274" height="121" rx="18" fill={colors.white} stroke={colors.ink} strokeWidth={STROKE} />
      <AnimatedGroup css={{ animation: `${selectRow} ${CYCLE}` }}>
        <rect x="524" y="218" width="252" height="48" rx="10" fill={colors.highlight} />
        <path d="M539 242l6 6 11-12" stroke={colors.canvas} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </AnimatedGroup>
      <text x="568" y="249" fontSize="19" fontWeight="500" fill={colors.ink}>Light</text>
      <text x="568" y="301" fontSize="19" fontWeight="500" fill={colors.ink}>Dark</text>
    </svg>
  );
}
