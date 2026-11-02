import React from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@/stitches.config';
import type { UpgradeMediaId } from './upgradeFeatures';
import { slideImages, zoomedBackgroundSlides } from './slideImages';
import background from './images/background.png';

// The illustrations are designed on a fixed pink canvas, so these don't follow the light/dark theme.
const canvas = '#FF709C';
const ink = '#2F0210';

// Slide images are exported without their background; this draws the shared one with the same crop as the Figma frames.
const StyledMedia = styled('div', {
  position: 'relative',
  width: '100%',
  aspectRatio: '418 / 235',
  borderRadius: '$medium',
  overflow: 'hidden',
  backgroundColor: canvas,
  backgroundImage: `url(${background})`,
  backgroundRepeat: 'no-repeat',
  color: ink,
  variants: {
    background: {
      default: {
        backgroundSize: '238.94% 100%',
        backgroundPosition: '50% 0',
      },
      zoomed: {
        backgroundSize: '693.42% 290.21%',
        backgroundPosition: '50% 72.71%',
      },
    },
  },
  defaultVariants: {
    background: 'default',
  },
});

const StyledImage = styled('img', {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
});

// Sits over the image in the same 418×235 space it was designed in.
const StyledOverlay = styled('svg', {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
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
      true: { backgroundColor: ink },
    },
  },
});

type Props = {
  media: UpgradeMediaId;
  step: number;
  total: number;
};

export default function UpgradeDialogMedia({
  media, step, total,
}: Props) {
  const { t } = useTranslation(['upgrade']);

  return (
    <StyledMedia
      data-testid={`upgrade-dialog-media-${media}`}
      background={zoomedBackgroundSlides.includes(media) ? 'zoomed' : 'default'}
    >
      <StyledImage src={slideImages[media]} alt="" aria-hidden />
      {media === 'plus' && (
        // The design's subtitle is left out of the export so the trial length comes from the translations.
        <StyledOverlay viewBox="0 0 418 235" aria-hidden>
          <text x="24" fill={ink} fontFamily="Inter, sans-serif" fontSize="11">
            <tspan x="24" y="159">{t('plusBanner.line1')}</tspan>
            <tspan x="24" y="176">{t('plusBanner.line2')}</tspan>
          </text>
        </StyledOverlay>
      )}
      {total > 1 && (
        <StyledDots aria-hidden>
          {Array.from({ length: total }, (_, i) => <StyledDot key={i} active={i === step} />)}
        </StyledDots>
      )}
    </StyledMedia>
  );
}
