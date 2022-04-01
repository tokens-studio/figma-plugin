import React from 'react';
import { useSelector } from 'react-redux';
import isEqual from 'lodash.isequal';
import { uiStateSelector } from '@/selectors';
import createAnnotation from './createAnnotation';

export default function AnnotationBuilder() {
  const uiState = useSelector(uiStateSelector, isEqual);

  return (
    <div>
      {Object.entries(uiState.mainNodeSelectionValues).length > 0 && (
      <div className="flex flex-row items-center justify-between pb-4 mb-4 border-b border-gray-200 text-xxs z-1">
        <div className="font-bold">Add as annotation</div>
        <div className="flex flex-row">
          <button
            className="p-1 button button-secondary"
            type="button"
            onClick={() => createAnnotation(uiState.mainNodeSelectionValues, 'left')}
          >
            ←
          </button>
          <div className="flex flex-col">
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
          </div>
          <button
            className="p-1 button button-secondary"
            type="button"
            onClick={() => createAnnotation(uiState.mainNodeSelectionValues, 'right')}
          >
            →
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
