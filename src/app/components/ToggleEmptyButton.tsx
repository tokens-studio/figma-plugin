import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../store';
import Button from './Button';

export default function ToggleEmptyButton() {
  const { showEmptyGroups } = useSelector((state: RootState) => state.uiState);
  const dispatch = useDispatch<Dispatch>();
  return (
    <div className="flex items-center justify-center mt-4 mb-4">
      <Button variant="secondary" size="small" onClick={() => dispatch.uiState.toggleShowEmptyGroups()}>
        {showEmptyGroups ? 'Hide' : 'Show'}
        {' '}
        empty groups
      </Button>
    </div>
  );
}
