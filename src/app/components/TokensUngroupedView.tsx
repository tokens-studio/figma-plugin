import React from 'react';
import { useDispatch } from 'react-redux';
import { DeepKeyTokenMap, EditTokenObject } from '@/types/tokens';
import TokenGroup from './TokenGroup/TokenGroup';
import { ShowFormOptions, ShowNewFormOptions } from '@/types';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { Dispatch } from '../store';
import Box from './Box';
import Blankslate from './Blankslate';

type Props = {
  tokens: DeepKeyTokenMap
};

export default function TokensUngroupedView({ tokens }: Props) {
  const dispatch = useDispatch<Dispatch>();

  const showForm = React.useCallback(({ token, name, status }: ShowFormOptions) => {
    console.log('token', token);

    dispatch.uiState.setShowEditForm(true);
    dispatch.uiState.setEditToken({
      ...token,
      type: token?.type,
      status,
      initialName: name,
      name,
    } as EditTokenObject);
  }, [dispatch]);

  const showNewForm = React.useCallback(({ name = '' }: ShowNewFormOptions) => {
    showForm({ token: null, name, status: EditTokenFormStatus.CREATE });
  }, [showForm]);

  console.log('tokens', tokens);

  return (
    <Box css={{ padding: '$4' }}>
      {Object.entries(tokens).length > 0
        ? (
          <TokenGroup
            tokenValues={tokens}
            showNewForm={showNewForm}
            showForm={showForm}
          />
        ) : (
          <Box css={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          >
            <Blankslate title="Create your first token" text="Start by creating a token" />
          </Box>
        )}
    </Box>
  );
}
