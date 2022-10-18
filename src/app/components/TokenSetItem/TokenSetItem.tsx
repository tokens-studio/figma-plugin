import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import Checkbox from '../Checkbox';
import Box from '../Box';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuItemIndicator,
  ContextMenuCheckboxItem,
} from '../ContextMenu';
import IconGrabber from '@/icons/grabber.svg';
import { StyledGrabber } from './StyledGrabber';
import { StyledCheckbox } from './StyledCheckbox';
import { StyledButton } from './StyledButton';
import { StyledWrapper } from './StyledWrapper';
import { tokenSetStatusSelector } from '@/selectors';
import { RootState } from '@/app/store';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import IconIndeterminateAlt from '@/icons/indeterminate-alt.svg';
import { TreeItem } from '@/utils/tokenset';
import { StyledBeforeFlex } from './StyledBeforeFlex';

export type TokenSetItemProps = {
  item: TreeItem;
  isCollapsed?: boolean;
  isActive?: boolean;
  isChecked: boolean | 'indeterminate';
  canEdit: boolean;
  canDelete: boolean;
  canReorder?: boolean;
  extraBefore?: React.ReactNode;
  onClick: (item: TreeItem) => void;
  onCollapse?: (itemPath: string) => void;
  onCheck: (checked: boolean, item: TreeItem) => void;
  onRename: (set: string) => void;
  onDelete: (set: string) => void;
  onDuplicate: (set: string) => void;
  onTreatAsSource: (set: string) => void;
  onDragStart?: (event: React.PointerEvent<HTMLDivElement>, item: TreeItem) => void;
};

export function TokenSetItem({
  item,
  onClick,
  isActive = false,
  isChecked,
  onCheck,
  canEdit,
  canDelete,
  canReorder = false,
  extraBefore,
  onRename,
  onDelete,
  onDuplicate,
  onTreatAsSource,
  onDragStart,
}: TokenSetItemProps) {
  const statusSelector = useCallback((state: RootState) => (
    tokenSetStatusSelector(state, item.path)
  ), [item]);
  const tokenSetStatus = useSelector(statusSelector);

  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  const handleRename = useCallback(() => {
    onRename(item.path);
  }, [item.path, onRename]);

  const handleDelete = useCallback(() => {
    onDelete(item.path);
  }, [item.path, onDelete]);

  const handleDuplicate = useCallback(() => {
    onDuplicate(item.path);
  }, [item.path, onDuplicate]);

  const handleTreatAsSource = useCallback(() => {
    onTreatAsSource(item.path);
  }, [item.path, onTreatAsSource]);

  const handleCheckedChange = useCallback(() => {
    onCheck(!isChecked, item);
  }, [item, isChecked, onCheck]);

  const handleGrabberPointerDown = useCallback<React.PointerEventHandler<HTMLDivElement>>((event) => {
    if (onDragStart) onDragStart(event, item);
  }, [item, onDragStart]);

  const renderIcon = useCallback((checked: typeof isChecked, fallbackIcon: React.ReactNode) => {
    if (tokenSetStatus === TokenSetStatus.SOURCE) {
      return <IconIndeterminateAlt />;
    }
    return fallbackIcon;
  }, [tokenSetStatus]);

  const tokenSetItemBefore = (
    <StyledBeforeFlex>
      {canReorder ? (
        <StyledGrabber data-testid={`tokensetitem-${item.path}-grabber`} onPointerDown={handleGrabberPointerDown}>
          <IconGrabber />
        </StyledGrabber>
      ) : null}
    </StyledBeforeFlex>
  );

  return (
    <StyledWrapper>
      {!item.isLeaf ? (
        <StyledButton
          itemType="folder"
          type="button"
          data-testid={`tokensetitem-${item.path}`}
          css={{
            paddingLeft: `${5 * item.level}px`,
          }}
          isActive={isActive}
          onClick={handleClick}
        >
          {tokenSetItemBefore}
          <Box
            css={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '$textMuted',
              fontWeight: '$normal',
              userSelect: 'none',
            }}
          >
            {item.label}
          </Box>
          {extraBefore}
        </StyledButton>
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild id={`${item.path}-trigger`}>
            <StyledButton
              type="button"
              css={{
                paddingLeft: `${5 * item.level}px`,
              }}
              data-testid={`tokensetitem-${item.path}`}
              isActive={isActive}
              onClick={handleClick}
            >
              {tokenSetItemBefore}
              <Box
                css={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  userSelect: 'none',
                }}
              >
                {item.label}
              </Box>
            </StyledButton>
          </ContextMenuTrigger>
          {canEdit ? (
            <ContextMenuContent>
              <ContextMenuItem onSelect={handleRename}>Rename</ContextMenuItem>
              <ContextMenuItem onSelect={handleDuplicate}>Duplicate</ContextMenuItem>
              <ContextMenuItem disabled={!canDelete} onSelect={handleDelete}>
                Delete
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuCheckboxItem checked={tokenSetStatus === TokenSetStatus.SOURCE} onSelect={handleTreatAsSource}>
                <ContextMenuItemIndicator>
                  <CheckIcon />
                </ContextMenuItemIndicator>
                Treat as source
              </ContextMenuCheckboxItem>
            </ContextMenuContent>
          ) : null}
        </ContextMenu>
      )}

      <StyledCheckbox checked={isChecked}>
        <Checkbox
          id={item.path}
          data-testid={`tokensetitem-${item.path}-checkbox`}
          checked={isChecked}
          renderIcon={renderIcon}
          onCheckedChange={handleCheckedChange}
        />
      </StyledCheckbox>
    </StyledWrapper>
  );
}
