import React, { useCallback } from 'react';
import IconUndo from '../icons/IconUndo';
import { useCanUndo } from '../../hooks/useCanUndo';
import { styled } from '@/stitches.config';
import { UndoableEnhancerState } from '@/app/enhancers/undoableEnhancer/UndoableEnhancerState';

const StyledUndoButton = styled('button', {
  padding: '$4',
  marginLeft: 'auto',
});

const StyledUndoIcon = styled(IconUndo, {
  width: '12px',
  height: '12px',
});

export const NavbarUndoButton: React.FC = () => {
  const canUndo = useCanUndo();

  const handleUndo = useCallback(() => {
    UndoableEnhancerState.undo();
  }, []);

  if (canUndo) {
    return (
      <StyledUndoButton type="button" onClick={handleUndo}>
        <StyledUndoIcon />
      </StyledUndoButton>
    );
  }

  return null;
};
