import React from 'react';
import { keyframes } from '@/stitches.config';
import {
  AnimatedGroup, colors, FONT_FAMILY, Raised, STROKE, TokensStudioMark, VIEWBOX,
} from './shared';

// Tokens flow Figma → Tokens Studio → a single tokens file, shown as dots travelling along the connectors.
const travel = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-58px)' },
  '15%, 85%': { opacity: 1 },
  '100%': { opacity: 0, transform: 'translateX(58px)' },
});

const pulse = keyframes({
  '0%, 40%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
});

const CYCLE_MS = 2400;
const CONNECTOR_Y = 237;

const documentPath = (dx: number, dy: number) => `M${638 + dx} ${172 + dy}H${700 + dx}L${726 + dx} ${198 + dy}V${283 + dy}Q${726 + dx} ${299 + dy} ${710 + dx} ${299 + dy}H${638 + dx}Q${622 + dx} ${299 + dy} ${622 + dx} ${283 + dy}V${188 + dy}Q${622 + dx} ${172 + dy} ${638 + dx} ${172 + dy}Z`;

function TravellingDot({ cx, delay }: { cx: number; delay: number }) {
  return (
    <AnimatedGroup
      css={{ animation: `${travel} ${CYCLE_MS}ms ease-in-out infinite` }}
      style={{ animationDelay: `${delay}ms` }}
    >
      <circle cx={cx} cy={CONNECTOR_Y} r="8" fill={colors.white} stroke={colors.ink} strokeWidth={STROKE} />
    </AnimatedGroup>
  );
}

export default function MultiFileSyncAnimation(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" fontFamily={FONT_FAMILY} {...props}>
      <rect width="836" height="470" fill={colors.canvas} />
      <circle cx="836" cy="0" r="96" fill={colors.blob} />
      <path d="M590 340C640 250 660 170 730 130C780 105 836 110 836 110V470H700C680 420 640 380 590 340Z" fill={colors.blob} />

      <text
        x="418"
        y="97"
        fontSize="28"
        fontWeight="600"
        textAnchor="middle"
        textLength="178"
        lengthAdjust="spacingAndGlyphs"
        fill={colors.ink}
        stroke={colors.ink}
        strokeWidth="1.5"
      >
        SINGLE FILE
      </text>

      <line x1="215" y1={CONNECTOR_Y} x2="355" y2={CONNECTOR_Y} stroke={colors.ink} strokeWidth={STROKE} />
      <line x1="483" y1={CONNECTOR_Y} x2="622" y2={CONNECTOR_Y} stroke={colors.ink} strokeWidth={STROKE} />
      <TravellingDot cx={285} delay={0} />
      <TravellingDot cx={552} delay={CYCLE_MS / 2} />

      {/* Figma */}
      <Raised x={110} y={184} width={105} height={105} radius={18} />
      <svg x="145" y="210" width="35" height="52" viewBox="-2 -2 42 61" stroke={colors.ink} strokeWidth="3.4" fill="none">
        <path d="M19 0H9.5a9.5 9.5 0 0 0 0 19H19Z" />
        <path d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19Z" />
        <path d="M19 19H9.5a9.5 9.5 0 0 0 0 19H19Z" />
        <circle cx="28.5" cy="28.5" r="9.5" />
        <path d="M19 38H9.5a9.5 9.5 0 1 0 9.5 9.5Z" />
      </svg>

      {/* Tokens Studio */}
      <AnimatedGroup css={{ animation: `${pulse} ${CYCLE_MS}ms ease-in-out infinite` }}>
        <Raised x={355} y={172} width={128} height={128} radius={22} fill={colors.ink} />
        <TokensStudioMark x={387} y={204} size={64} color={colors.white} />
      </AnimatedGroup>

      {/* Tokens file */}
      <path d={documentPath(-10, 10)} fill={colors.shadow} />
      <path d={documentPath(0, 0)} fill={colors.white} stroke={colors.ink} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x="640" y="194" width="66" height="12" rx="6" fill={colors.surface} />
      <rect x="640" y="216" width="66" height="12" rx="6" fill={colors.surface} />
      <rect x="640" y="238" width="66" height="12" rx="6" fill={colors.surface} />
      <text x="674" y="280" fontSize="16" fontWeight="600" textAnchor="middle" fill={colors.ink}>TOKENS</text>
    </svg>
  );
}
