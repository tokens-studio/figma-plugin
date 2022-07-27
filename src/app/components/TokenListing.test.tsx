import React from 'react';
import { TokenTypes } from '@/constants/TokenTypes';
import { DeepKeyTokenMap, TokenTypeSchema } from '@/types/tokens';
import { fireEvent, render } from '../../../tests/config/setupTest';
import TokenListing from './TokenListing';

const key = 'sizing';
const schema = {
  label: 'Sizing',
  property: 'Size',
  type: TokenTypes.SIZING,
  schemas: {
    value: {
      type: 'string',
    },
  },
};
const values = {
  1: {
    name: 'small',
    type: TokenTypes.SIZING,
    value: '1',
  },
  2: {
    name: 'big',
    type: TokenTypes.SIZING,
    value: '2',
  },
};

describe('TokenListing', () => {
  it('should display token list', () => {
    const { getByText } = render(<TokenListing
      tokenKey={key}
      label={key}
      schema={schema as TokenTypeSchema}
      values={values as DeepKeyTokenMap}
    />);
    expect(getByText('sizing')).toBeInTheDocument();
    expect(getByText('small')).toBeInTheDocument();
  });

  it('should expand all', async () => {
    const { getByText, getByTestId, queryByText } = render(<TokenListing
      tokenKey={key}
      label={key}
      schema={schema as TokenTypeSchema}
      values={values as DeepKeyTokenMap}
    />);
    fireEvent.click(getByTestId('tooltip-collapse-sizing'));
    expect(
      queryByText('small'),
    ).not.toBeInTheDocument();
  });
});
