import React from 'react';
import { Stack, Label } from '@tokens-studio/ui';
import {
  DiffAddedIcon, DiffRemovedIcon, PencilIcon, AlertFillIcon,
} from '@primer/octicons-react';
/*

This component is not needed at the moment,
but it will be used in the future to show the theme details in the theme list.

@TODO: Add a custom hook to get the theme details from the theme object

*/

export const ThemeDetails = () => (
  <Stack
    direction="row"
    gap={4}
    css={{
      label: {
        display: 'inline-flex',
        flexDirection: 'row',
      },
    }}
  >
    <Label css={{ color: '$successFg', fontSize: '$xxsmall' }}>
      <DiffAddedIcon size="small" />
      9999
    </Label>
    <Label css={{ color: '$dangerFg', fontSize: '$xxsmall' }}>
      <DiffRemovedIcon size="small" />
      9999
    </Label>
    <Label css={{ color: '$accentEmphasis', fontSize: '$xxsmall' }}>
      <PencilIcon size="small" />
      9999
    </Label>
    <Label css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
      <AlertFillIcon size="small" />
      9999
    </Label>
  </Stack>
);
