import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
import Tooltip from '../Tooltip';

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
  const { t } = useTranslation(['tokens']);

  const handleToggleCollapsedWithAlt = useCallback((e: React.MouseEvent<HTMLButtonElement>, key: string) => {
    e.stopPropagation();
    if (e.altKey) {
      // Alt + click: toggle all folders
      const allFolderPaths = items.filter((item) => !item.isLeaf).map((item) => item.key);
      if (allFolderPaths.length === 0) return;

      const collapsedCount = allFolderPaths.filter((path) => collapsed.includes(path)).length;
      if (collapsedCount === allFolderPaths.length) {
        // All are collapsed, expand all
        dispatch.tokenState.setCollapsedTokenSets([]);
      } else {
        // Some or none are collapsed, collapse all
        dispatch.tokenState.setCollapsedTokenSets(allFolderPaths);
      }
    } else {
      // Regular click: toggle individual folder
      dispatch.tokenState.setCollapsedTokenSets(collapsed.includes(key) ? collapsed.filter((s) => s !== key) : [...collapsed, key]);
    }
  }, [dispatch, collapsed, items]);

  const mappedItems = useMemo(() => (
    items.filter((item) => (
      // remove items which are in a collapsed parent
      !collapsed.some((parentKey) => item.parent === parentKey
      || (item.parent?.startsWith(parentKey) && item.parent?.charAt(parentKey.length) === '/'))
    )).map((item) => ({
      item,
      handleClick: (e: React.MouseEvent<HTMLButtonElement>) => handleToggleCollapsedWithAlt(e, item.key),
    }))
  ), [items, collapsed, handleToggleCollapsedWithAlt]);

  return (
    <>
      {mappedItems.map(({ item, handleClick }) => (
        <RenderItem key={item.id} item={item}>
          <StyledItem>
            <RenderItemContent item={item}>
              {(!item.isLeaf) && (
                <Tooltip label={`Alt + Click ${t('toggle')}`}>
                  <StyledFolderButton
                    type="button"
                    onClick={handleClick}
                    size={keyPosition === 'start' ? 'small' : 'default'}
                  >
                    {keyPosition === 'start' ? (
                      <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                        <StyledThemeLabel variant="folder">{item.label}</StyledThemeLabel>
                      </Box>
                    ) : null}
                    <StyledFolderButtonChevronBox collapsed={collapsed.includes(item.key)}>
                      <IconExpandArrow />
                    </StyledFolderButtonChevronBox>
                    {keyPosition === 'end' ? (
                      <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
                        <StyledThemeLabel variant="folder">{item.label}</StyledThemeLabel>
                      </Box>
                    ) : null}
                  </StyledFolderButton>
                </Tooltip>
              )}
            </RenderItemContent>
          </StyledItem>
        </RenderItem>
      ))}
    </>
  );
}
