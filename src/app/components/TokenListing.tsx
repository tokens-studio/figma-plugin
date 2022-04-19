import React from 'react';
import isEqual from 'lodash.isequal';
import { useDispatch, useSelector } from 'react-redux';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { TokenTypeSchema } from '@/types/tokens';
import Heading from './Heading';
import Icon from './Icon';
import TokenTree, { ShowFormOptions, ShowNewFormOptions } from './TokenTree';
import Tooltip from './Tooltip';
import { Dispatch } from '../store';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  collapsedSelector, displayTypeSelector, editProhibitedSelector, showEmptyGroupsSelector,
} from '@/selectors';

type Props = Omit<TokenTypeSchema, 'type'> & {
  tokenKey: string;
  tokenType: TokenTypes;
};

const TokenListing: React.FC<Props> = ({
  tokenKey,
  label,
  schema,
  explainer = '',
  property,
  tokenType = TokenTypes.IMPLICIT,
  values,
}) => {
  const editProhibited = useSelector(editProhibitedSelector);
  const displayType = useSelector(displayTypeSelector);
  const showEmptyGroups = useSelector(showEmptyGroupsSelector);
  const collapsed = useSelector(collapsedSelector);
  const dispatch = useDispatch<Dispatch>();

  const showDisplayToggle = React.useMemo(() => tokenType === TokenTypes.COLOR, [tokenType]);

  const [isIntCollapsed, setIntCollapsed] = React.useState(false);

  const showForm = React.useCallback(({ token, name, isPristine = false }: ShowFormOptions) => {
    const tokenValue = token?.value ?? (typeof schema?.value === 'object' ? schema.value : '');

    // @TODO fix these typings depending on usage
    dispatch.uiState.setShowEditForm(true);
    dispatch.uiState.setEditToken({
      value: tokenValue,
      type: tokenType,
      name,
      initialName: name,
      isPristine,
      explainer,
      property,
      schema: schema?.value,
      optionsSchema: schema?.options,
      options: {
        description: token?.description,
        type: tokenType,
      },
    });
  }, [schema, tokenType, dispatch, explainer, property]);

  const showNewForm = React.useCallback(({ name = '' }: ShowNewFormOptions) => {
    showForm({ token: null, name, isPristine: true });
  }, [showForm]);

  const handleSetIntCollapsed = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (e.altKey) {
      dispatch.uiState.toggleCollapsed();
    } else {
      setIntCollapsed(!isIntCollapsed);
    }
  }, [dispatch, isIntCollapsed]);

  React.useEffect(() => {
    setIntCollapsed(collapsed);
  }, [collapsed]);

  if (!values && !showEmptyGroups) return null;

  return (
    <div className="border-b border-gray-200" data-cy={`tokenlisting-${tokenKey}`}>
      <div className="relative flex items-center justify-between space-x-8">
        <button
          className={`flex items-center w-full h-full p-4 space-x-2 hover:bg-gray-100 focus:outline-none ${
            isIntCollapsed ? 'opacity-50' : null
          }`}
          data-cy={`tokenlisting-header-${tokenKey}`}
          type="button"
          onClick={handleSetIntCollapsed}
        >
          <Tooltip label={`Alt + Click to ${collapsed ? 'expand' : 'collapse'} all`}>
            <div className="p-2 -m-2">
              {isIntCollapsed ? (
                <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3L1 0v6l4-3z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5l3-4H0l3 4z" fill="currentColor" />
                </svg>
              )}
            </div>
          </Tooltip>
          <Heading size="small">{label}</Heading>
        </button>
        <div className="absolute right-0 flex mr-2">
          {showDisplayToggle && (
            <Tooltip label={displayType === 'GRID' ? 'Show as List' : 'Show as Grid'}>
              <button
                onClick={() => dispatch.uiState.setDisplayType(displayType === 'GRID' ? 'LIST' : 'GRID')}
                type="button"
                className="button button-ghost"
              >
                <Icon name={displayType === 'GRID' ? 'list' : 'grid'} />
              </button>
            </Tooltip>
          )}

          <Tooltip label="Add a new token">
            <button
              disabled={editProhibited}
              data-cy="button-add-new-token"
              className="button button-ghost"
              type="button"
              onClick={() => {
                showNewForm({});
              }}
            >
              <Icon name="add" />
            </button>
          </Tooltip>
        </div>
      </div>
      {values && (
        <DndProvider backend={HTML5Backend}>
          <div
            className={`px-4 pb-4 ${isIntCollapsed ? 'hidden' : null}`}
            data-cy={`tokenlisting-${tokenKey}-content`}
          >
            <TokenTree
              tokenValues={values}
              showNewForm={showNewForm}
              showForm={showForm}
              schema={schema}
              type={tokenType}
              displayType={displayType}
            />
          </div>
        </DndProvider>
      )}
    </div>
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
