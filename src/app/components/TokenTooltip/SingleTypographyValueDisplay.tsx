import React from 'react';
import Box from '../Box';
import { TokenTypographyValue } from '@/types/values';

// @TODO confirm whether the typography token values
// can still have the .value property from legacy

type Props = {
  value: TokenTypographyValue
  shouldResolve: boolean
};

export const SingleTypographyValueDisplay: React.FC<Props> = ({ value, shouldResolve }) => (shouldResolve ? (
  <Box css={{ color: '$fgToolTipMuted' }}>
    {value.fontFamily}
    {' '}
    {value.fontWeight}
    {' '}
    /
    {' '}
    {value.fontSize}
  </Box>
) : (
  <Box css={{ color: '$fgToolTipMuted' }}>
    <div>
      Font:
      {' '}
      {value.fontFamily}
    </div>
    <div>
      Weight:
      {' '}
      {value.fontWeight}
    </div>
    <div>
      Size:
      {' '}
      {value.fontSize}
    </div>
    <div>
      Line Height:
      {' '}
      {value.lineHeight}
    </div>
    <div>
      Tracking:
      {' '}
      {value.letterSpacing}
    </div>
    <div>
      Paragraph Spacing:
      {' '}
      {value.paragraphSpacing}
    </div>
    <div>
      Text Case:
      {' '}
      {value.textCase}
    </div>
    <div>
      Text Decoration:
      {' '}
      {value.textDecoration}
    </div>
  </Box>
));
