import React from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@/stitches.config';
import type { UpgradeMediaId } from './upgradeFeatures';

// Animated SVGs exported from the design file, keyed by slide. Slides without an entry fall back to a placeholder.
const animations: Partial<Record<UpgradeMediaId, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {};

// The illustrations are designed on a fixed pink canvas, so these don't follow the light/dark theme.
const StyledMedia = styled('div', {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  borderRadius: '$medium',
  overflow: 'hidden',
  backgroundColor: '#ff7aa5',
  color: '#2b0012',
  '& > svg': {
    display: 'block',
    width: '100%',
    height: '100%',
  },
});

const StyledPlaceholder = styled('div', {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '$6',
  gap: '$3',
});

const StyledDots = styled('div', {
  position: 'absolute',
  bottom: '$4',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '$3',
});

const StyledDot = styled('span', {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: 'rgba(43, 0, 18, 0.25)',
  variants: {
    active: {
      true: { backgroundColor: '#2b0012' },
    },
  },
});

type Props = {
  media: UpgradeMediaId;
  title: string;
  step: number;
  total: number;
};

export default function UpgradeDialogMedia({
  media, title, step, total,
}: Props) {
  const { t } = useTranslation(['upgrade']);
  const Animation = animations[media];

  return (
    <StyledMedia data-testid={`upgrade-dialog-media-${media}`}>
      {Animation ? <Animation aria-hidden /> : (
        <StyledPlaceholder aria-hidden>
          {media === 'plus' ? (
            <>
              <span style={{ fontSize: '32px', fontWeight: 900, lineHeight: 0.95 }}>
                GET MORE
                <br />
                WITH PLUS
              </span>
              <span style={{ fontSize: '12px' }}>{t('unlock.heading')}</span>
            </>
          ) : (
            <span style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase' }}>{title}</span>
          )}
        </StyledPlaceholder>
      )}
      {total > 1 && (
        <StyledDots aria-hidden>
          {Array.from({ length: total }, (_, i) => <StyledDot key={i} active={i === step} />)}
        </StyledDots>
      )}
    </StyledMedia>
  );
}
