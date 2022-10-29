import React from 'react';
import { TokenTypes } from '@/constants/TokenTypes';
import { DeepKeyTokenMap, TokenTypeSchema } from '@/types/tokens';
import {
  fireEvent, render,
} from '../../../tests/config/setupTest';
import TokenListing from './TokenListing';
import { store } from '../store';
import tokenTypes from '@/config/tokenType.defs.json';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';

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

  it('should collapse token list', async () => {
    const { getByTestId } = render(<TokenListing
      tokenKey={key}
      label={key}
      schema={schema as TokenTypeSchema}
      values={values as DeepKeyTokenMap}
    />);
    await fireEvent.click(getByTestId('tokenlisting-sizing-collapse-button'));
    const { collapsedTokenTypeObj } = store.getState().tokenState;
    expect(collapsedTokenTypeObj.sizing).toBe(true);
  });

  it('should collapse all token list', async () => {
    const { getByTestId } = render(<TokenListing
      tokenKey={key}
      label={key}
      schema={schema as TokenTypeSchema}
      values={values as DeepKeyTokenMap}
    />);
    await fireEvent.click(getByTestId('tokenlisting-sizing-collapse-button'), {
      bubbles: true,
      cancelable: true,
      altKey: true,
    });
    const { collapsedTokenTypeObj } = store.getState().tokenState;
    expect(collapsedTokenTypeObj).toEqual(Object.keys(tokenTypes).reduce<Partial<Record<TokenTypes, boolean>>>((acc, tokenType) => {
      acc[tokenType as TokenTypes] = true;
      return acc;
    }, {}));
  });

  it('should show new form', async () => {
    const { getByTestId } = render(
      <TokenListing
        tokenKey={key}
        label={key}
        schema={schema as TokenTypeSchema}
        values={values as DeepKeyTokenMap}
      />,
    );
    await fireEvent.click(getByTestId('button-add-new-token'));
    expect(store.getState().uiState.editToken).toEqual({
      initialName: '',
      name: '',
      schema,
      type: TokenTypes.SIZING,
      status: EditTokenFormStatus.CREATE,
    });
  });
});
