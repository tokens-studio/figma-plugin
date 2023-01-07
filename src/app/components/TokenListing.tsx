import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { DeepKeyTokenMap, EditTokenObject } from '@/types/tokens';
import TokenGroup from './TokenGroup/TokenGroup';
import { Dispatch } from '../store';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  collapsedSelector, collapsedTokenTypeObjSelector, showEmptyGroupsSelector,
} from '@/selectors';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { ShowFormOptions, ShowNewFormOptions } from '@/types';
import Box from './Box';
import TokenListingHeading from './TokenListingHeading';

type Props = {
  type: TokenTypes
  values: DeepKeyTokenMap
};

const TokenListing: React.FC<Props> = ({
  values,
  type,
}) => {
  const showEmptyGroups = useSelector(showEmptyGroupsSelector);
  const collapsedTokenTypeObj = useSelector(collapsedTokenTypeObjSelector);
  const collapsed = useSelector(collapsedSelector);
  const dispatch = useDispatch<Dispatch>();

  const showForm = React.useCallback(({ token, name, status }: ShowFormOptions) => {
    dispatch.uiState.setShowEditForm(true);
    dispatch.uiState.setEditToken({
      ...token,
      type: token ? token.type : type,
      status,
      initialName: name,
      name,
    } as EditTokenObject);
  }, [dispatch.uiState, type]);

  const showNewForm = React.useCallback(({ name = '' }: ShowNewFormOptions) => {
    showForm({ token: null, name, status: EditTokenFormStatus.CREATE });
  }, [showForm]);

  const showDisplayToggle = React.useMemo(() => type === TokenTypes.COLOR, [type]);

  // TODO: Move this to state
  const handleSetIntCollapsed = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (e.altKey) {
      dispatch.uiState.toggleCollapsed();
      const newCollapsedObj = Object.keys(collapsedTokenTypeObj).reduce<Record<string, boolean>>((acc, key) => {
        acc[key] = !collapsed;
        return acc;
      }, {});
      dispatch.tokenState.setCollapsedTokenTypeObj(newCollapsedObj);
    } else {
      dispatch.tokenState.setCollapsedTokenTypeObj({ ...collapsedTokenTypeObj, [type]: !collapsedTokenTypeObj[type] });
    }
  }, [dispatch.uiState, dispatch.tokenState, collapsedTokenTypeObj, collapsed, type]);

  if (!values && !showEmptyGroups) return null;

  return (
    <Box css={{ borderBottom: '1px solid $borderMuted' }} data-cy={`tokenlisting-${type}`}>
      <TokenListingHeading onCollapse={handleSetIntCollapsed} showDisplayToggle={showDisplayToggle} type={type} showNewForm={showNewForm} isCollapsed={collapsedTokenTypeObj[type]} />
      {values && (
        <DndProvider backend={HTML5Backend}>
          <Box
            data-cy={`tokenlisting-${type}-content`}
            css={{
              padding: '$4',
              paddingTop: 0,
              display: collapsedTokenTypeObj[type] ? 'none' : 'block',
            }}
          >
            <TokenGroup
              tokenValues={values}
              showNewForm={showNewForm}
              showForm={showForm}
              type={type}
            />
          </Box>
        </DndProvider>
      )}
    </Box>
  );
};

// @README the memo props check used to be a deep equals
// but because the token sorting is done based on the order of an object
// it comes as back as equals since object key order is disregarded in lodash's
// isEqual check.
// @TODO we should probably not rely on object key order for sorting anyways
// since JS technically does not always ensure the same order of object keys.
// in practice this is always the case but it is something to keep in mind in theory
export default React.memo(TokenListing);
