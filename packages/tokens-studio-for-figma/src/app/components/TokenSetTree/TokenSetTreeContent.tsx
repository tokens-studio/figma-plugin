import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@tokens-studio/ui';
import { IconExpandArrow } from '@/icons';
import { StyledFolderButton } from './StyledFolderButton';
import { StyledItem } from './StyledItem';
import { StyledFolderButtonChevronBox } from './StyledFolderButtonChevronBox';
import { Dispatch } from '../../store';
import {
  collapsedTokenSetsSelector,
} from '@/selectors';
import { StyledThemeLabel } from '../ManageThemesModal/StyledThemeLabel';
import { Count } from '../Count';

type TreeItem<ItemType = unknown> = {
  key: string
  level: number
  parent: string | null
  isLeaf: boolean,
  label: string
  id: string
  tokenCount?: number
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
        <RenderItem key={item.id} item={item}>
          <StyledItem>
            <RenderItemContent item={item}>
              {(!item.isLeaf) && (
                <StyledFolderButton
                  type="button"
                  onClick={onToggleCollapsed}
                  size={keyPosition === 'start' ? 'small' : 'default'}
                >
                  {keyPosition === 'start' ? (
                    <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                      <StyledThemeLabel variant="folder">{item.label}</StyledThemeLabel>
                      {item.tokenCount !== undefined && item.tokenCount > 0 && (
                        <Count count={item.tokenCount} />
                      )}
                    </Box>
                  ) : null}
                  <StyledFolderButtonChevronBox collapsed={collapsed.includes(item.key)}>
                    <IconExpandArrow />
                  </StyledFolderButtonChevronBox>
                  {keyPosition === 'end' ? (
                    <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                      <StyledThemeLabel variant="folder">{item.label}</StyledThemeLabel>
                      {item.tokenCount !== undefined && item.tokenCount > 0 && (
                        <Count count={item.tokenCount} />
                      )}
                    </Box>
                  ) : null}
                </StyledFolderButton>
              )}
            </RenderItemContent>
          </StyledItem>
        </RenderItem>
      ))}
    </>
  );
}
