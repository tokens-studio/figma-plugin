import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showEmptyGroupsSelector } from '@/selectors';
import { Dispatch } from '../store';
import Button from './Button';
import Stack from './Stack';

export default function ToggleEmptyButton() {
  const showEmptyGroups = useSelector(showEmptyGroupsSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleShowEmptyGroups = React.useCallback(() => {
    dispatch.uiState.toggleShowEmptyGroups(null);
  }, [dispatch]);

  return (
    <Stack direction="row" align="center" justify="center" css={{ marginTop: '$4', marginBottom: '$4' }}>
      <Button variant="secondary" size="small" onClick={handleShowEmptyGroups}>
        {showEmptyGroups ? 'Hide' : 'Show'}
        {' '}
        empty groups
      </Button>
    </Stack>
  );
}
