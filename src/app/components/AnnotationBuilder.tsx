import React from 'react';
import { useSelector } from 'react-redux';
import { uiStateSelector } from '@/selectors';
import createAnnotation from './createAnnotation';
import Stack from './Stack';
import Text from './Text';
import Box from './Box';
import { isEqual } from '@/utils/isEqual';

export default function AnnotationBuilder() {
  const uiState = useSelector(uiStateSelector, isEqual);

  const createAnnotationLeft = React.useCallback(() => {
    createAnnotation(uiState.mainNodeSelectionValues, 'left');
  }, [uiState]);

  const createAnnotationTop = React.useCallback(() => {
    createAnnotation(uiState.mainNodeSelectionValues, 'top');
  }, [uiState]);

  const createAnnotationBottom = React.useCallback(() => {
    createAnnotation(uiState.mainNodeSelectionValues, 'bottom');
  }, [uiState]);

  const createAnnotationRight = React.useCallback(() => {
    createAnnotation(uiState.mainNodeSelectionValues, 'right');
  }, [uiState]);

  return Object.entries(uiState.mainNodeSelectionValues).length > 0 ? (
    <Box css={{ borderBottom: '1px solid $border', paddingBottom: '$4', marginBottom: '$4' }}>
      <Stack direction="row" align="center" justify="between">
        <Text bold>Add as annotation</Text>
        <Stack direction="row" gap={0}>
          <button
            className="p-1 button button-secondary"
            type="button"
            onClick={createAnnotationLeft}
          >
            ←
          </button>
          <Stack direction="column">
            <button
              className="p-1 button button-secondary"
              type="button"
              onClick={createAnnotationTop}
            >
              ↑
            </button>
            <button
              className="p-1 button button-secondary"
              type="button"
              onClick={createAnnotationBottom}
            >
              ↓
            </button>
          </Stack>
          <button
            className="p-1 button button-secondary"
            type="button"
            onClick={createAnnotationRight}
          >
            →
          </button>
        </Stack>
      </Stack>
    </Box>
  ) : null;
}
