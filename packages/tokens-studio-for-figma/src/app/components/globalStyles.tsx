import { globalCss } from '@/stitches.config';
import '@/app/assets/fonts/fonts.css';

export const globalStyles = globalCss({
  body: {
    fontFamily: '$sans',
    fontSize: '$xsmall',
    letterSpacing: '0',
    color: '$fgDefault',
  },
  form: {
    marginBottom: 0,
  },
  'button[disabled]': {
    opacity: 0.5,
  },
  'button:focus': {
    outline: 'none',
  },
  'textarea.input, select.input, input.input': {
    outline: 'none',
    padding: '$2',
  },
  '.input textarea:focus, .input select:focus, .input input:focus': {
    outline: 'none',
  },
  input: {
    background: '$bgDefault',
  },
  '.drag-over-item-grid-absolute': {
    position: 'absolute',
    content: "''",
    width: '5px',
    height: '24px',
    top: '0px',
    left: -'4px',
    backgroundColor: '$accentDefault',
  },
  '.drag-over-item-list-absolute': {
    position: 'absolute',
    content: "''",
    width: '100%',
    height: '4px',
    top: '-4px',
    backgroundColor: '$accentDefault',
  },
  '.scroll-container': {
    overflowY: 'scroll',
  },
  '.content::-webkit-scrollbar, .ReactModal__Content::-webkit-scrollbar,  textarea::-webkit-scrollbar': {
    width: 'var(--sizes-scrollbarWidth, 9px)',
  },
  '.overflow-x-auto::-webkit-scrollbar': {
    height: '9px',
  },
  '.content::-webkit-scrollbar-thumb, .overflow-x-auto::-webkit-scrollbar-thumb, .ReactModal__Content::-webkit-scrollbar-thumb, textarea::-webkit-scrollbar-thumb': {
    backgroundColor: '$borderMuted',
    borderRadius: '9px',
    border: '2px solid var(--figma-color-bg)',
  },
  '.content-dark::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--colors-contextMenuFgMuted, #000) !important',
    borderColor: 'var(--colors-contextMenuBg, #333) !important',
    borderRadius: '9px',
    border: '2px solid',
  },
  '#corner': {
    position: 'fixed',
    right: 0,
    bottom: 0,
    cursor: 'nwse-resize',
    pointerEvents: 'all',
  },
  '.color-picker .react-colorful': {
    width: '100%',
  },
  '.color-picker .react-colorful__saturation': {
    borderRadius: '$small',
  },

  '.color-picker .react-colorful__hue, .color-picker .react-colorful__alpha': {
    height: '$4',
    borderRadius: '$small',
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
  '.ReactModal__Content': {
    backgroundColor: '$bgDefault !important',
    border: '1px solid !important',
    borderColor: '$borderMuted !important',
    overflowX: 'hidden !important',
  },
});
