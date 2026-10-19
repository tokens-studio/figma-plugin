import React from 'react';
import {
  AnimatedGroup, colors, float, FONT_FAMILY, popIn, Raised, TokensStudioMark, VIEWBOX,
} from './shared';

// Feature pills scattered over the plugin card; they drop in one after another, then drift gently.
const pills = [
  {
    label: 'Themes', x: 540, y: 166, width: 136, rotate: -4,
  },
  {
    label: 'Multi-File Sync', x: 530, y: 240, width: 210, rotate: -8,
  },
  {
    label: 'Docs Generator', x: 820, y: 180, width: 210, rotate: 20,
  },
  {
    label: 'Color Modifiers', x: 790, y: 262, width: 210, rotate: 12,
  },
  {
    label: 'Branching', x: 698, y: 332, width: 160, rotate: -4,
  },
  {
    label: 'Composition Tokens', x: 590, y: 398, width: 262, rotate: 6,
  },
];

const PILL_HEIGHT = 56;
const POP_IN_MS = 500;
const STAGGER_MS = 120;

const headline = [
  { text: 'GET', y: 160, width: 124 },
  { text: 'MORE', y: 218, width: 189 },
  { text: 'WITH PLUS', y: 276, width: 330 },
];

export default function PlusAnimation(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" fontFamily={FONT_FAMILY} {...props}>
      <rect width="836" height="470" fill={colors.canvas} />
      <circle cx="836" cy="0" r="96" fill={colors.blob} />

      {headline.map(({ text, y, width }) => (
        <text
          key={text}
          x="48"
          y={y}
          fontSize="62"
          fontWeight="600"
          letterSpacing="-1"
          textLength={width}
          lengthAdjust="spacingAndGlyphs"
          fill={colors.ink}
          stroke={colors.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        >
          {text}
        </text>
      ))}
      <text x="48" y="318" fontSize="20" fill={colors.ink}>Try Pro features free</text>
      <text x="48" y="350" fontSize="20" fill={colors.ink}>for 30 Days with «Starter Plus»</text>

      {/* Plugin card */}
      <Raised x={510} y={34} width={380} height={480} radius={32} />
      <rect x="545" y="68" width="32" height="32" rx="7" fill={colors.ink} />
      <TokensStudioMark x={551} y={74} size={20} color={colors.white} />
      <text x="590" y="92" fontSize="20" fill={colors.ink}>Plugin</text>
      <rect x="662" y="68" width="76" height="32" rx="8" fill={colors.badge} />
      <path d="M672 89h14l1.5-9-4 3-3.5-5-3.5 5-4-3z" fill={colors.canvas} />
      <text x="694" y="90" fontSize="14" fontWeight="600" fill={colors.canvas}>PLUS</text>
      <rect x="545" y="124" width="320" height="104" rx="10" fill={colors.surface} />
      <rect x="545" y="236" width="200" height="10" rx="5" fill={colors.surface} />
      <rect x="545" y="290" width="240" height="10" rx="5" fill={colors.surface} />
      <rect x="545" y="366" width="320" height="10" rx="5" fill={colors.surface} />
      <rect x="545" y="420" width="190" height="80" rx="12" fill={colors.surface} />
      <rect x="750" y="420" width="120" height="80" rx="12" fill={colors.surface} />

      {pills.map(({
        label, x, y, width, rotate,
      }, index) => {
        const delay = index * STAGGER_MS;
        return (
          <g key={label} transform={`translate(${x} ${y}) rotate(${rotate})`}>
            <AnimatedGroup
              css={{ animation: `${popIn} ${POP_IN_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both, ${float} 3s ease-in-out infinite` }}
              style={{ animationDelay: `${delay}ms, ${delay + POP_IN_MS + index * 200}ms` }}
            >
              <Raised x={-width / 2} y={-PILL_HEIGHT / 2} width={width} height={PILL_HEIGHT} radius={16} />
              <text x="0" y="8" fontSize="22" fontWeight="500" textAnchor="middle" fill={colors.ink}>{label}</text>
            </AnimatedGroup>
          </g>
        );
      })}
    </svg>
  );
}
