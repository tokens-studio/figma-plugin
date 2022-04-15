import React, { useCallback, useMemo, useState } from 'react';
import IconChevronDown from '../icons/IconChevronDown';
import { StyledFolderButton } from './StyledFolderButton';
import { StyledItem } from './StyledItem';
import { StyledFolderButtonChevronBox } from './StyledFolderButtonChevronBox';

type TreeOrListItem<ItemType = unknown> = {
  key: string
  level: number
  parent: string | null
  isLeaf: boolean
} & ItemType;

type SharedProps<T extends TreeOrListItem> = {
  displayType: 'tree' | 'list'
  items: T[]
  renderItem: (props: { item: T, children: React.ReactNode }) => React.ReactNode
  renderItemContent: (props: { item: T, children: React.ReactNode }) => React.ReactNode
};

type Props<T extends TreeOrListItem> = SharedProps<T>;

export function TokenSetListOrTree<T extends TreeOrListItem>({
  displayType,
  items,
  renderItem,
  renderItemContent,
}: Props<T>) {
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const handleToggleCollapsed = useCallback((key: string) => {
    setCollapsed(collapsed.includes(key) ? collapsed.filter((s) => s !== key) : [...collapsed, key]);
  }, [collapsed]);

  const renderedItems = useMemo(() => (
    items.filter((item) => (
      // remove items which are in a collapsed parent
      !collapsed.some((parentKey) => item.parent?.startsWith(parentKey))
    )).map((item) => {
      const defaultContent = (!item.isLeaf && displayType === 'tree') && (
        <StyledFolderButton
          type="button"
          css={{ left: `${5 * item.level}px` }}
          onClick={() => handleToggleCollapsed(item.key)}
        >
          <StyledFolderButtonChevronBox collapsed={collapsed.includes(item.key)}>
            <IconChevronDown />
          </StyledFolderButtonChevronBox>
        </StyledFolderButton>
      );

      const renderedContent = renderItemContent({ item, children: defaultContent });
      const renderedItem = renderItem({
        item,
        children: <StyledItem>{renderedContent}</StyledItem>,
      });
      return renderedItem;
    })
  ), [
    displayType,
    collapsed,
    items,
    renderItem,
    renderItemContent,
    handleToggleCollapsed,
  ]);

  return React.createElement(React.Fragment, {}, ...renderedItems);
}
