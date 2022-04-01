import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Icon from './Icon';
import TokenButton from './TokenButton';
import TokenGroupHeading from './TokenGroupHeading';
import Tooltip from './Tooltip';
import { TokenTypes } from '@/constants/TokenTypes';
import { tokenStateSelector } from '@/selectors';
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

function TokenTree({
  displayType, tokenValues, showNewForm, showForm, schema, path = null, type,
}: Props) {
  const { editProhibited } = useSelector(tokenStateSelector);
  const tokenValuesEntries = React.useMemo(() => Object.entries(tokenValues), [tokenValues]);
  const [draggedToken, setDraggedToken] = useState<SingleToken | null>(null);
  const [dragOverToken, setDragOverToken] = useState<SingleToken | null>(null);

  return (
    <div className="flex justify-start flex-row flex-wrap">
      {tokenValuesEntries.map(([name, value]) => {
        const stringPath = [path, name].filter((n) => n).join('.');

        return (
          <React.Fragment key={stringPath}>
            {typeof value === 'object' && !isSingleToken(value) ? (
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
        );
      })}
    </div>
  );
}

export default TokenTree;
