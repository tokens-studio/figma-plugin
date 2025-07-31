import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@tokens-studio/ui';
import { showEmptyGroupsSelector } from '@/selectors';
import { Dispatch } from '../store';
import Stack from './Stack';

export default function ToggleEmptyButton() {
  const showEmptyGroups = useSelector(showEmptyGroupsSelector);
  const dispatch = useDispatch<Dispatch>();

  const { t } = useTranslation(['tokens']);

  const handleShowEmptyGroups = React.useCallback(() => {
    dispatch.uiState.toggleShowEmptyGroups(null);
  }, [dispatch]);

  return (
    <Stack direction="row" align="center" justify="center" css={{ marginTop: '$4', marginBottom: '$4' }}>
      <Button variant="secondary" size="small" onClick={handleShowEmptyGroups}>
        {t(showEmptyGroups ? 'hide' : 'show')}
        {' '}
        {t('emptyGroups')}
      </Button>
    </Stack>
  );
}
