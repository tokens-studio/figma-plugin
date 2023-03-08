import React from 'react';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  EditTokenObject, SingleToken,
} from '@/types/tokens';
import { render } from '../../../tests/config/setupTest';
import TypographyInput from './TypographyInput';

const tokens: SingleToken[] = [];

const internalEditToken = {
  initialName: '',
  name: '',
  status: 'create',
  type: 'typography',
  schema: {
    schemas: {
      value: {
        type: 'object',
        properties: {
          fontFamily: { type: 'string' },
          fontWeight: { type: 'string' },
          lineHeight: { type: 'string' },
          fontSize: { type: 'string' },
          letterSpacing: { type: 'string' },
          paragraphSpacing: { type: 'string' },
          paragraphIndent: { type: 'string' },
          textDecoration: { type: 'string' },
          textCase: { type: 'string' },
        },
      },
    },
  },
} as unknown as Extract<EditTokenObject, { type: TokenTypes.TYPOGRAPHY }>;
const mockHandleTypographyValueChange = jest.fn();
const mockHandleTypographyAliasValueChange = jest.fn();
const mockHandleTypographyValueDownShiftInputChange = jest.fn();
const mockHandleDownShiftInputChange = jest.fn();

describe('Typography Input', () => {
  it('should display typography token input', () => {
    const { getByText } = render(<TypographyInput
      internalEditToken={internalEditToken}
      handleTypographyValueChange={mockHandleTypographyValueChange}
      handleTypographyAliasValueChange={mockHandleTypographyAliasValueChange}
      resolvedTokens={tokens}
      handleTypographyValueDownShiftInputChange={mockHandleTypographyValueDownShiftInputChange}
      handleDownShiftInputChange={mockHandleDownShiftInputChange}
    />);
    expect(getByText('Typography')).toBeInTheDocument();
  });
});
