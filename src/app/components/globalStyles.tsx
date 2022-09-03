import { globalCss } from '@/stitches.config';

export const globalStyles = globalCss({
  '#corner': {
    position: 'fixed',
    right: 0,
    bottom: 0,
    cursor: 'nwse-resize',
  },
  '.color-picker .react-colorful': {
    width: '100%',
  },
  '.color-picker .react-colorful__saturation': {
    borderRadius: '$default',
  },

  '.color-picker .react-colorful__hue, .color-picker .react-colorful__alpha': {
    height: '$4',
    borderRadius: '$default',
  },

  '.color-picker .react-colorful__hue-pointer, .color-picker .react-colorful__alpha-pointer': {
    height: '$4',
    width: '$4',
  },

  '.color-picker .react-colorful__hue': {
    marginTop: '$3',
    marginBottom: '$2',
  },

  '.color-picker .react-colorful__alpha': {
    marginTop: '$2',
    marginBottom: '$3',
  },

});
