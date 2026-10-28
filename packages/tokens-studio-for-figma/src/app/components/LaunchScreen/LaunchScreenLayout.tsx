import { styled } from '@/stitches.config';

// Full-height dark backdrop shared by the loading and launch screens. Content sits
// at the bottom; the space above is reserved for the launch artwork.
export const LaunchScreenLayout = styled('div', {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: '100vh',
  paddingBottom: '40px',
  background: '$loadingScreenBg',
  color: '$loadingScreenFg',
  fontSize: '12px',
  fontWeight: '$sansMedium',
  lineHeight: 1.2,
  letterSpacing: '-0.12px',
  textAlign: 'center',
});

export const LaunchScreenTextButton = styled('button', {
  color: '$loadingScreenFgMuted',
  '&:hover, &:focus-visible': {
    color: '$loadingScreenFg',
  },
  variants: {
    underline: {
      true: {
        textDecoration: 'underline',
      },
    },
  },
});
