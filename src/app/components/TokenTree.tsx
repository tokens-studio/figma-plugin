import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TokenGroupHeading from './TokenGroupHeading';
import { TokenButton } from './TokenButton';
import { editProhibitedSelector } from '@/selectors';
import { DeepKeyTokenMap, SingleToken, TokenTypeSchema } from '@/types/tokens';
import { isSingleToken } from '@/utils/is';
import IconButton from './IconButton';
import AddIcon from '@/icons/add.svg';

export type ShowFormOptions = {
  name: string;
  status?: string;
  token: SingleToken | null;
};

export type ShowNewFormOptions = {
  name?: string;
};

type Props = {
  displayType: 'GRID' | 'LIST';
  schema: TokenTypeSchema;
  tokenValues: DeepKeyTokenMap;
  path?: string | null;
  showNewForm: (opts: ShowNewFormOptions) => void;
  showForm: (opts: ShowFormOptions) => void;
};

const TokenTree: React.FC<Props> = ({
  displayType, tokenValues, showNewForm, showForm, schema, path = null,
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
                <TokenGroupHeading label={name} path={stringPath} id="listing" type={schema.type} />
                <div className="opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <IconButton
                    icon={<AddIcon />}
                    tooltip="Add a new token"
                    tooltipSide="left"
                    onClick={handleShowNewForm}
                    disabled={editProhibited}
                    dataCy="button-add-new-token-in-group"
                  />
                </div>
              </div>

              <TokenTree
                tokenValues={value}
                showNewForm={showNewForm}
                showForm={showForm}
                schema={schema}
                path={stringPath}
                displayType={displayType}
              />
            </div>
          ) : (
            <TokenButton
              type={schema.type}
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
