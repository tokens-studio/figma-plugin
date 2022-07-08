import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import IconChevronDown from '@/icons/chevrondown.svg';
import { StyledFolderButton } from './StyledFolderButton';
import { StyledItem } from './StyledItem';
import { StyledFolderButtonChevronBox } from './StyledFolderButtonChevronBox';
import { Dispatch } from '../../store';
import {
  collapsedTokenSetsSelector,
} from '@/selectors';

type TreeOrListItem<ItemType = unknown> = {
  key: string
  level: number
  parent: string | null
  isLeaf: boolean
} & ItemType;

type SharedProps<T extends TreeOrListItem> = {
  displayType: 'tree' | 'list'
  items: T[]
  renderItem?: (props: { item: T, children: React.ReactNode }) => React.ReactElement | null
  renderItemContent: (props: { item: T, children: React.ReactNode }) => React.ReactElement | null
};

type Props<T extends TreeOrListItem> = SharedProps<T>;

export function TokenSetListOrTree<T extends TreeOrListItem>({
  displayType,
  items,
  renderItem: RenderItem = ({ children }) => React.createElement(React.Fragment, {}, children),
  renderItemContent: RenderItemContent,
}: Props<T>) {
  const collapsed = useSelector(collapsedTokenSetsSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleToggleCollapsed = useCallback((key: string) => {
    dispatch.tokenState.setCollapsedTokenSets(collapsed.includes(key) ? collapsed.filter((s) => s !== key) : [...collapsed, key]);
  }, [collapsed]);

  const mappedItems = useMemo(() => (
    items.filter((item) => (
      // remove items which are in a collapsed parent
      !collapsed.some((parentKey) => item.parent === parentKey
      || (item.parent?.startsWith(parentKey) && item.parent?.charAt(parentKey.length) === '/'))
    )).map((item) => ({
      item,
      onToggleCollapsed: () => handleToggleCollapsed(item.key),
    }))
  ), [items, collapsed, handleToggleCollapsed]);

  return (
    <>
      {mappedItems.map(({ item, onToggleCollapsed }) => (
        <RenderItem key={item.key} item={item}>
          <StyledItem>
            <RenderItemContent item={item}>
              {(!item.isLeaf && displayType === 'tree')
              && (
                <StyledFolderButton
                  type="button"
                  css={{ left: `${5 * item.level}px` }}
                  onClick={onToggleCollapsed}
                >
                  <StyledFolderButtonChevronBox>
                    <IconChevronDown />
                  </StyledFolderButtonChevronBox>
                </StyledFolderButton>
              )}
            </RenderItemContent>
          </StyledItem>
        </RenderItem>
      ))}
    </>
  );
}
