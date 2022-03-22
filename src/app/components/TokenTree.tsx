import * as React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch, RootState } from '../store';
import Icon from './Icon';
import TokenButton from './TokenButton';
import TokenGroupHeading from './TokenGroupHeading';
import Tooltip from './Tooltip';
import { isSingleToken, isTypographyToken } from './utils';

function TokenTree({
  tokenValues, showNewForm, showForm, schema, path = null, type = '', resolvedTokens,
}) {
  const { editProhibited } = useSelector((state: RootState) => state.tokenState);
  const tokenState = useSelector((state: RootState) => state.tokenState);
  const dispatch = useDispatch<Dispatch>();
  const [dragOverToken, setDragOverToken] = useState(null);
  const [draggedTokenIndex, setDraggedTokenIndex] = useState(null);
  const [dragOverTokenIndex, setDragOverTokenIndex] = useState(null);
  const [dragItemType, setDragItemType] = useState(null);

  const onDragStart = (e, type, index) => {
    e.stopPropagation();
    setDraggedTokenIndex(index);
    setDragItemType(type);
  };
  const onDragEnd = (e) => {
    e.stopPropagation();
    setDragOverToken(null);
  };
  const onDrag = (e) => e.stopPropagation();
  const onDragEnter = (e) => e.stopPropagation();
  const onDragLeave = (e) => e.stopPropagation();

  const onDragOver = (e, name, index) => {
    e.stopPropagation();
    e.preventDefault();
    setDragOverToken(name);
    setDragOverTokenIndex(index);
  };

  const onDrop = (e) => {
    e.stopPropagation();
    if (draggedTokenIndex !== null && dragOverTokenIndex !== null) handleNewOrder(draggedTokenIndex, dragOverTokenIndex);
  };

  const handleNewOrder = (draggedTokenIndex, dragOverTokenIndex) => {
    const set = tokenState.tokens[tokenState.activeTokenSet];
    let draggedItemStartIndex = null;

    if (draggedTokenIndex !== null && dragOverTokenIndex !== null && dragItemType) {
      const currentSet = set.filter((item, index) => {
        if (item.type === dragItemType) {
          if (!draggedItemStartIndex) draggedItemStartIndex = index;
          return true;
        }
      });
      if (draggedTokenIndex !== null) {
        const draggedItem = currentSet[draggedTokenIndex];
        const insertTokensIndex = draggedTokenIndex > dragOverTokenIndex ? dragOverTokenIndex : dragOverTokenIndex - 1;

        currentSet.splice(draggedTokenIndex, 1);
        currentSet.splice(insertTokensIndex, 0, draggedItem);
        set.splice(draggedItemStartIndex, currentSet.length - 1, ...currentSet);

        const newTokens = {
          ...tokenState.tokens,
          [tokenState.activeTokenSet]: set,
        };

        dispatch.tokenState.setTokenData({ values: newTokens, shouldUpdate: false });
      }
      setDragItemType(null);
    }
  };

  return (
    <div className="flex justify-start flex-row flex-wrap">
      {Object.entries(tokenValues).map(([name, value], index) => {
        const stringPath = [path, name].filter((n) => n).join('.');

        return (
          <React.Fragment key={stringPath}>
            <div
              draggable
              onDrag={onDrag}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragStart={(e) => onDragStart(e, type, index)}
              onDragOver={(e) => onDragOver(e, name, index)}
              className={dragItemType && dragOverToken && dragOverToken === name ? 'drag-over-item' : ''}
            >
              {typeof value === 'object' && !isTypographyToken(value) && !isSingleToken(value) ? (
                <div className="property-wrapper w-full" data-cy={`token-group-${stringPath}`}>
                  <div className="flex items-center justify-between group">
                    <TokenGroupHeading label={name} path={stringPath} id="listing" />
                    <Tooltip label="Add a new token" side="left">
                      <button
                        disabled={editProhibited}
                        data-cy="button-add-new-token-in-group"
                        className="button button-ghost opacity-0 group-hover:opacity-100 focus:opacity-100"
                        type="button"
                        onClick={() => {
                          showNewForm({ name: `${stringPath}.` });
                        }}
                      >
                        <Icon name="add" />
                      </button>
                    </Tooltip>
                  </div>

                  <TokenTree
                    tokenValues={value}
                    showNewForm={showNewForm}
                    showForm={showForm}
                    schema={schema}
                    path={stringPath}
                    type={type}
                    resolvedTokens={resolvedTokens}
                  />
                </div>
              ) : (
                <TokenButton type={type} token={value} showForm={showForm} resolvedTokens={resolvedTokens} />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default TokenTree;
