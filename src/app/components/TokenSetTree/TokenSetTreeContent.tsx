import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconExpandArrow } from '@/icons';
import { StyledFolderButton } from './StyledFolderButton';
import { StyledItem } from './StyledItem';
import { StyledFolderButtonChevronBox } from './StyledFolderButtonChevronBox';
import { Dispatch } from '../../store';
import {
  collapsedTokenSetsSelector,
} from '@/selectors';
import { StyledThemeLabel } from '../ManageThemesModal/StyledThemeLabel';

type TreeItem<ItemType = unknown> = {
  key: string
  level: number
  parent: string | null
  isLeaf: boolean
} & ItemType;

type SharedProps<T extends TreeItem> = {
  items: T[]
  renderItem?: (props: { item: T, children: React.ReactNode }) => React.ReactElement | null
  renderItemContent: (props: { item: T, children: React.ReactNode }) => React.ReactElement | null
  keyPosition?: 'start' | 'end'
};

type Props<T extends TreeItem> = SharedProps<T>;

export function TokenSetTreeContent<T extends TreeItem>({
  items,
  renderItem: RenderItem = ({ children }) => React.createElement(React.Fragment, {}, children),
  renderItemContent: RenderItemContent,
  keyPosition = 'start',
}: Props<T>) {
  const collapsed = useSelector(collapsedTokenSetsSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleToggleCollapsed = useCallback((key: string) => {
    dispatch.tokenState.setCollapsedTokenSets(collapsed.includes(key) ? collapsed.filter((s) => s !== key) : [...collapsed, key]);
  }, [dispatch, collapsed]);

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
              {(!item.isLeaf) && (
                <StyledFolderButton
                  type="button"
                  onClick={onToggleCollapsed}
                  size={keyPosition === 'start' ? 'small' : 'default'}
                >
                  {keyPosition === 'start' ? <StyledThemeLabel variant="folder">{item.key.split('/').pop()}</StyledThemeLabel> : null}
                  <StyledFolderButtonChevronBox collapsed={collapsed.includes(item.key)}>
                    <IconExpandArrow />
                  </StyledFolderButtonChevronBox>
                  {keyPosition === 'end' ? <StyledThemeLabel variant="folder">{item.key.split('/').pop()}</StyledThemeLabel> : null}
                </StyledFolderButton>
              )}
            </RenderItemContent>
          </StyledItem>
        </RenderItem>
      ))}
    </>
  );
}
