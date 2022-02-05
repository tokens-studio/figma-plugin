import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import useTokens from '../store/useTokens';
import Button from './Button';
import Icon from './Icon';
import Tooltip from './Tooltip';
import createAnnotation from './createAnnotation';

function Inspector() {
  const uiState = useSelector((state: RootState) => state.uiState);
  const { findToken, removeNodeData } = useTokens();

  return (
    <div className="space-y-2 p-4">
      {Object.entries(uiState.selectionValues).length > 0 && (
        <div className="pb-4 mb-4 flex flex-row items-center text-xxs justify-between z-1 border-b border-gray-200">
          <div className="font-bold">Add as annotation</div>
          <div className="flex flex-row">
            <button
              className="button button-secondary p-1"
              type="button"
              onClick={() => createAnnotation(uiState.selectionValues, 'left')}
            >
              ←
            </button>
            <div className="flex flex-col">
              <button
                className="button button-secondary p-1"
                type="button"
                onClick={() => createAnnotation(uiState.selectionValues, 'top')}
              >
                ↑
              </button>
              <button
                className="button button-secondary p-1"
                type="button"
                onClick={() => createAnnotation(uiState.selectionValues, 'bottom')}
              >
                ↓
              </button>
            </div>
            <button
              className="button button-secondary p-1"
              type="button"
              onClick={() => createAnnotation(uiState.selectionValues, 'right')}
            >
              →
            </button>
          </div>
        </div>
      )}
      <div className="space-y-1">
        {Object.entries(uiState.selectionValues)
          .filter(([, value]) => value !== 'delete')
          .map(([key, value]) => (
            <div key={key} className="flex flex-row justify-between items-start">
              <code className="flex space-x-2 flex-wrap">
                <div className="font-bold">{key}</div>
                :
                {' '}
                <div className="p-1 bg-gray-700 rounded text-white text-xxs">
                  $
                  {typeof value === 'string' && value.split('.').join('-')}
                </div>
                <div className="text-gray-500 break-all">{`/* ${JSON.stringify(findToken(value))} */`}</div>
              </code>
              <Tooltip label="Remove token from layer" variant="right">
                <button className="button button-ghost" type="button" onClick={() => removeNodeData(key)}>
                  <Icon name="trash" />
                </button>
              </Tooltip>
            </div>
          ))}
      </div>
      {Object.entries(uiState.selectionValues).length > 0 ? (
        <Button variant="secondary" onClick={() => removeNodeData()}>
          Remove all tokens from layer
        </Button>
      ) : (
        <div className="text-sm">No tokens stored on layer</div>
      )}
    </div>
  );
}

export default Inspector;
