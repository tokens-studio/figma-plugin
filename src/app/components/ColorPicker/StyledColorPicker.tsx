import { styled } from '@/stitches.config';

export const StyledColorPicker = styled('div', {
  marginBottom: '$1',

  '& .react-colorful': {
    width: '100%',
  },

  '& .react-colorful__saturation': {
    borderRadius: '$default',
  },

  '& .react-colorful__hue, & .react-colorful__alpha': {
    height: '$5',
    borderRadius: '$default',
  },

  '& .react-colorful__hue-pointer, & .react-colorful__alpha-pointer': {
    width: '$5',
    height: '$5',
  },

  '& .react-colorful__hue': {
    marginTop: '$2',
    marginBottom: '$1',
  },

  '& .react-colorful__alpha': {
    marginTop: '$1',
    marginBottom: '$2',
  },
});
