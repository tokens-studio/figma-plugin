import React, { useCallback } from 'react';
import IconUndo from '@/icons/undo.svg';
import { useCanUndo } from '../../hooks/useCanUndo';
import { styled } from '@/stitches.config';
import { UndoableEnhancerState } from '@/app/enhancers/undoableEnhancer/UndoableEnhancerState';
import Tooltip from '../Tooltip';
import { useActionsHistory } from '@/app/hooks/useActionsHistory';
import { AnyAction } from '@/types/redux';

const StyledUndoButton = styled('button', {
  padding: '$4',
  marginLeft: 'auto',
});

const StyledUndoIcon = styled(IconUndo, {
  width: '12px',
  height: '12px',
});

const actionLabels: Partial<Record<AnyAction<true>['type'], string>> = {
  'tokenState/deleteToken': 'Delete token',
  'tokenState/duplicateToken': 'Duplicate token',
  'tokenState/createToken': 'Create token',
};

export const NavbarUndoButton: React.FC = () => {
  const canUndo = useCanUndo();
  const actionsHistory = useActionsHistory();

  const handleUndo = useCallback(() => {
    UndoableEnhancerState.undo();
  }, []);

  if (canUndo && actionsHistory.length) {
    return (
      <Tooltip label={`Undo "${actionLabels[actionsHistory[actionsHistory.length - 1].action.type]}"`}>
        <StyledUndoButton type="button" onClick={handleUndo}>
          <StyledUndoIcon />
        </StyledUndoButton>
      </Tooltip>
    );
  }

  return null;
};
