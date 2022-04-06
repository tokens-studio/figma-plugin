import React from 'react';
import { useSelector } from 'react-redux';
import isEqual from 'lodash.isequal';
import { uiStateSelector } from '@/selectors';
import createAnnotation from './createAnnotation';
import Stack from './Stack';
import Text from './Text';

export default function AnnotationBuilder() {
  const uiState = useSelector(uiStateSelector, isEqual);

  return Object.entries(uiState.mainNodeSelectionValues).length > 0 ? (
    <Stack direction="row" align="center" justify="between">
      <Text bold>Add as annotation</Text>
      <Stack direction="row" gap={0}>
        <button
          className="p-1 button button-secondary"
          type="button"
          onClick={() => createAnnotation(uiState.mainNodeSelectionValues, 'left')}
        >
          ←
        </button>
        <Stack direction="column">
          <button
            className="p-1 button button-secondary"
            type="button"
            onClick={() => createAnnotation(uiState.mainNodeSelectionValues, 'top')}
          >
            ↑
          </button>
          <button
            className="p-1 button button-secondary"
            type="button"
            onClick={() => createAnnotation(uiState.mainNodeSelectionValues, 'bottom')}
          >
            ↓
          </button>
        </Stack>
        <button
          className="p-1 button button-secondary"
          type="button"
          onClick={() => createAnnotation(uiState.mainNodeSelectionValues, 'right')}
        >
          →
        </button>
      </Stack>
    </Stack>
  ) : null;
}
