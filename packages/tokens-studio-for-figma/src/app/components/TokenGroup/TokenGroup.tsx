import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { TokenGroupHeading } from './TokenGroupHeading';
import { StyledTokenGroup, StyledTokenGroupItems } from './StyledTokenGroup';
import { TokenButton } from '@/app/components/TokenButton';
import { displayTypeSelector } from '@/selectors';
import { DeepKeyTokenMap, SingleToken, TokenTypeSchema } from '@/types/tokens';
import { isSingleToken } from '@/utils/is';
import { collapsedTokensSelector } from '@/selectors/collapsedTokensSelector';
import { ShowFormOptions, ShowNewFormOptions } from '@/types';
import { TokenTypes } from '@/constants/TokenTypes';

type Props = {
  schema: TokenTypeSchema;
  tokenValues: DeepKeyTokenMap;
  path?: string | null;
  tokenKey: string;
  showNewForm: (opts: ShowNewFormOptions) => void;
  showForm: (opts: ShowFormOptions) => void;
};

const TokenGroup: React.FC<Props> = ({
  tokenValues, showNewForm, showForm, schema, path = null, tokenKey,
}) => {
  const collapsed = useSelector(collapsedTokensSelector);
  const displayType = useSelector(displayTypeSelector);

  const tokenValuesEntries = React.useMemo(() => (
    Object.entries(tokenValues).map(([name, value]) => {
      const stringPath = [path, name].filter((n) => n).join('.');
      const isTokenGroup = !isSingleToken(value);
      const parent = path || '';

      return {
        stringPath,
        name,
        value,
        isTokenGroup,
        parent,
      };
    })
  ), [tokenValues, path]);

  const mappedItems = useMemo(() => (
    tokenValuesEntries.filter((item) => (
      // remove items which are in a collapsed parent
      !collapsed.some((parentKey) => (item.parent?.startsWith(parentKey) && item.parent?.charAt(parentKey.length) === '.')
      || item.parent === parentKey)
    )).map((item) => ({
      item,
    }))
  ), [tokenValuesEntries, collapsed]);

  const [draggedToken, setDraggedToken] = useState<SingleToken | null>(null);
  const [dragOverToken, setDragOverToken] = useState<SingleToken | null>(null);

  if (mappedItems.length === 0) {
    return null;
  }
  return (
    <StyledTokenGroup displayType={schema.type === TokenTypes.COLOR ? displayType : 'GRID'}>
      {mappedItems.map(({ item }) => (
        <React.Fragment key={item.stringPath}>
          {typeof item.value === 'object' && !isSingleToken(item.value) ? (
            // Need to add class to self-reference in css traversal
            <StyledTokenGroupItems className="property-wrapper" data-cy={`token-group-${item.stringPath}`}>
              <TokenGroupHeading showNewForm={showNewForm} label={item.name} path={item.stringPath} id="listing" type={schema.type || tokenKey} />
              <TokenGroup
                tokenValues={item.value}
                showNewForm={showNewForm}
                showForm={showForm}
                schema={schema}
                path={item.stringPath}
                tokenKey={tokenKey}
              />
            </StyledTokenGroupItems>
          ) : (
            <TokenButton
              type={schema.type}
              token={item.value}
              showForm={showForm}
              draggedToken={draggedToken}
              dragOverToken={dragOverToken}
              setDraggedToken={setDraggedToken}
              setDragOverToken={setDragOverToken}
            />
          )}
        </React.Fragment>
      ))}
    </StyledTokenGroup>
  );
};

export default React.memo(TokenGroup);
