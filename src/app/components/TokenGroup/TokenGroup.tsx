import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { token, useTokenData } from 'figma-tokens-library';
import { TokenGroupHeading } from './TokenGroupHeading';
import { StyledTokenGroup, StyledTokenGroupItems } from './StyledTokenGroup';
import { TokenButton } from '@/app/components/TokenButton';
import { displayTypeSelector } from '@/selectors';
import { DeepKeyTokenMap, SingleToken, TokenTypeSchema } from '@/types/tokens';
import { isSingleToken } from '@/utils/is';
import { collapsedTokensSelector } from '@/selectors/collapsedTokensSelector';
import { ShowFormOptions, ShowNewFormOptions } from '@/types';
import { TokenTypes } from '@/constants/TokenTypes';
import { emitter } from '@/dataset';

const [, groupType] = token.builder.first().use();

type Props = {
  schema: TokenTypeSchema;
  tokenValues: DeepKeyTokenMap;
  group: typeof groupType;
  path?: string | null;
  showNewForm: (opts: ShowNewFormOptions) => void;
  showForm: (opts: ShowFormOptions) => void;
};

// select all direct children of the group which have no type defined (-- thus inherit the group type)
// or who have the same type as the group
const [query, type] = token.builder.filter(`
  tokenSet._ref == $group.tokenSet._ref
  && (parent._ref == $group._id && (!defined(type) || type == $group.type))
`).use();

const TokenGroup: React.FC<Props> = ({
  tokenValues, group, showNewForm, showForm, schema, path = null,
}) => {
  const children = useTokenData<typeof type>(emitter, query, { group }, {
    debug: true,
  });
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

  if (!children?.length) {
    return null;
  }

  return (
    <StyledTokenGroup displayType={schema.type === TokenTypes.COLOR ? displayType : 'GRID'}>
      {children?.map((item) => (
        <React.Fragment key={item._id}>
          {!item.value ? (
            // Need to add class to self-reference in css traversal
            <StyledTokenGroupItems className="property-wrapper" data-cy={`token-group-${item._id}`}>
              <TokenGroupHeading showNewForm={showNewForm} label={item.name} path={item._id} id="listing" type={schema.type} />
              <TokenGroup
                tokenValues={{}}
                group={item}
                showNewForm={showNewForm}
                showForm={showForm}
                schema={schema}
              />
            </StyledTokenGroupItems>
          ) : (
            null
            // <TokenButton
            //   type={schema.type}
            //   token={item.value}
            //   showForm={showForm}
            //   draggedToken={draggedToken}
            //   dragOverToken={dragOverToken}
            //   setDraggedToken={setDraggedToken}
            //   setDragOverToken={setDragOverToken}
            // />
          )}
        </React.Fragment>
      ))}
    </StyledTokenGroup>
  );
};

export default React.memo(TokenGroup);
