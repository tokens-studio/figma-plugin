import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Icon from './Icon';
import TokenGroupHeading from './TokenGroupHeading';
import Tooltip from './Tooltip';
import { TokenButton } from './TokenButton';
import { TokenTypes } from '@/constants/TokenTypes';
import { editProhibitedSelector } from '@/selectors';
import { DeepKeyTokenMap, SingleToken, TokenTypeSchema } from '@/types/tokens';
import { isSingleToken } from '@/utils/is';

export type ShowFormOptions = {
  name: string;
  isPristine?: boolean;
  token: SingleToken | null;
};

export type ShowNewFormOptions = {
  name?: string;
};

type Props = {
  displayType: 'GRID' | 'LIST';
  type: TokenTypes;
  schema: TokenTypeSchema['schema']
  tokenValues: DeepKeyTokenMap
  path?: string | null
  showNewForm: (opts: ShowNewFormOptions) => void
  showForm: (opts: ShowFormOptions) => void
};

const TokenTree: React.FC<Props> = ({
  displayType, tokenValues, showNewForm, showForm, schema, path = null, type,
}) => {
  const editProhibited = useSelector(editProhibitedSelector);
  const tokenValuesEntries = React.useMemo(() => (
    Object.entries(tokenValues).map(([name, value]) => {
      const stringPath = [path, name].filter((n) => n).join('.');

      return {
        stringPath,
        name,
        value,
        handleShowNewForm: () => showNewForm({ name: `${stringPath}.` }),
      };
    })
  ), [path, tokenValues, showNewForm]);

  const [draggedToken, setDraggedToken] = useState<SingleToken | null>(null);
  const [dragOverToken, setDragOverToken] = useState<SingleToken | null>(null);

  return (
    <div className="flex justify-start flex-row flex-wrap">
      {tokenValuesEntries.map(({
        stringPath, name, value, handleShowNewForm,
      }) => (
        <React.Fragment key={stringPath}>
          {typeof value === 'object' && !isSingleToken(value) ? (
            <div className="property-wrapper w-full" data-cy={`token-group-${stringPath}`}>
              <div className="flex items-center justify-between group">
                <TokenGroupHeading label={name} path={stringPath} id="listing" type = {type}/>
                <Tooltip label="Add a new token" side="left">
                  <button
                    disabled={editProhibited}
                    data-cy="button-add-new-token-in-group"
                    className="button button-ghost opacity-0 group-hover:opacity-100 focus:opacity-100"
                    type="button"
                    onClick={handleShowNewForm}
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
                displayType={displayType}
              />
            </div>
          ) : (
            <TokenButton
              type={type}
              token={value}
              showForm={showForm}
              draggedToken={draggedToken}
              dragOverToken={dragOverToken}
              displayType={displayType}
              setDraggedToken={setDraggedToken}
              setDragOverToken={setDragOverToken}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default React.memo(TokenTree);
