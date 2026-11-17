import type { StitchesCSS } from '@/types';

// Context menu items reserve more room for the check mark than dropdown menu items do.
// Use the dropdown gutter so labels and check marks line up the same way in every menu.
export const contextMenuContentCss: StitchesCSS = {
  '& [role^="menuitem"]': {
    paddingLeft: '$6',
  },
};
