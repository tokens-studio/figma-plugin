import React, { useCallback } from 'react';
import { useDragControls } from 'framer-motion';
import Checkbox from '../Checkbox';
import IconChevronDown from '../icons/IconChevronDown';
import Box from '../Box';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '../ContextMenu';
import { TreeItem } from '@/app/components/utils/getTree';
import IconGrabber from '@/icons/grabber.svg';
import { ConditionalReorderWrapper } from './ConditionalReorderWrapper';
import { StyledFolderButtonChevronBox } from './StyledFolderButtonChevronBox';
import { StyledFolderButton } from './StyledFolderButton';
import { StyledGrabber } from './StyledGrabber';
import { StyledCheckbox } from './StyledCheckbox';
import { StyledButton } from './StyledButton';
import { StyledWrapper } from './StyledWrapper';

export type ListItem = {
  path: string,
  key: string,
  parent: string | null,
  type: 'set',
  level: number,
  label: string,
};

export type TokenSetItemProps<Item extends TreeItem | ListItem> = {
  item: Item;
  isCollapsed?: boolean;
  isActive?: boolean;
  onClick: (item: Item) => void;
  isChecked: boolean | 'indeterminate';
  onCollapse?: (itemPath: string) => void;
  onCheck: (checked: boolean, item: Item) => void;
  canEdit: boolean;
  canDelete: boolean;
  canReorder?: boolean;
  onRename: (set: string) => void;
  onDelete: (set: string) => void;
  onTreatAsSource: (set: string) => void;
  onReorder?: () => void;
};

export function TokenSetItem<Item extends TreeItem | ListItem = TreeItem | ListItem>({
  item,
  isCollapsed = false,
  onCollapse,
  onClick,
  onReorder,
  isActive = false,
  isChecked,
  onCheck,
  canEdit,
  canDelete,
  canReorder = false,
  onRename,
  onDelete,
  onTreatAsSource,
}: TokenSetItemProps<Item>) {
  const controls = useDragControls();

  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  const handleCollapse = useCallback(() => {
    if (onCollapse) onCollapse(item.path);
  }, [item, onCollapse]);

  const handleRename = useCallback(() => {
    onRename(item.path);
  }, [item.path, onRename]);

  const handleDelete = useCallback(() => {
    onDelete(item.path);
  }, [item.path, onDelete]);

  const handleTreatAsSource = useCallback(() => {
    onTreatAsSource(item.path);
  }, [item.path, onTreatAsSource]);

  const handleCheckedChange = useCallback(() => {
    onCheck(!isChecked, item);
  }, [item, isChecked, onCheck]);

  const handleGrabberPointerDown = useCallback<React.PointerEventHandler<HTMLDivElement>>((event) => {
    controls.start(event);
  }, [controls]);

  return (
    <ConditionalReorderWrapper
      canReorder={canReorder}
      item={item}
      controls={controls}
      onReorder={onReorder}
    >
      <StyledWrapper>
        {item.type === 'folder' ? (
          <StyledFolderButton
            css={{
              left: `${5 * item.level}px`,
            }}
            onClick={handleCollapse}
            type="button"
          >
            <StyledFolderButtonChevronBox collapsed={isCollapsed}>
              <IconChevronDown />
            </StyledFolderButtonChevronBox>
          </StyledFolderButton>
        ) : null}
        {item.type === 'folder' ? (
          <StyledButton
            itemType={item.type}
            type="button"
            isActive={isActive}
            onClick={handleClick}
          >
            <Box
              css={{
                paddingLeft: `${5 * item.level}px`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '$textMuted',
                fontWeight: '$normal',
                userSelect: 'none',
              }}
            >
              {item.label}
            </Box>
          </StyledButton>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger asChild id={`${item.path}-trigger`}>
              <StyledButton
                itemType={item.type}
                type="button"
                isActive={isActive}
                onClick={handleClick}
              >
                <Box
                  css={{
                    paddingLeft: `${5 * item.level}px`,
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
                <ContextMenuItem disabled={!canDelete} onSelect={handleDelete}>
                  Delete
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onSelect={handleTreatAsSource}>
                  Treat as source
                </ContextMenuItem>
              </ContextMenuContent>
            ) : null}
          </ContextMenu>
        )}

        <StyledCheckbox checked={isChecked}>
          <Checkbox
            id={item.path}
            checked={isChecked}
            onCheckedChange={handleCheckedChange}
          />
        </StyledCheckbox>
        {canReorder ? (
          <StyledGrabber onPointerDown={handleGrabberPointerDown}>
            <IconGrabber />
          </StyledGrabber>
        ) : null}
      </StyledWrapper>
    </ConditionalReorderWrapper>
  );
}
