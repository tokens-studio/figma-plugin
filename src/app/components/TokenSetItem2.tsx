import React from 'react';
import { Reorder, useMotionValue, useDragControls } from 'framer-motion';
import { styled } from '@/stitches.config';
import Checkbox from './Checkbox';
import IconChevronDown from './icons/IconChevronDown';
import Box from './Box';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from './ContextMenu';
import { TreeItem } from './utils/getTree';
import IconGrabber from '@/icons/grabber.svg';
import { useRaisedShadow } from './use-raised-shadow';

export type TokenSetItemProps = {
  item: TreeItem;
  isCollapsed?: boolean;
  isActive?: boolean;
  onClick: () => void;
  isChecked: boolean | 'indeterminate';
  onCollapse?: () => void;
  onCheck: (checked: boolean) => void;
  canEdit: boolean;
  canDelete: boolean;
  canReorder?: boolean;
  onRename: (set: string) => void;
  onDelete: (set: string) => void;
  onReorder?: () => void;
};

const StyledChevron = styled(Box, {
  transition: 'transform 0.2s ease-in-out',
  color: '$textSubtle',
  variants: {
    collapsed: {
      true: {
        transform: 'rotate(-90deg)',
      },
      false: {
        transform: 'rotate(0deg)',
      },
    },
  },
});

const ChevronButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  height: '100%',
  width: '$4',
  '&:focus': {
    boxShadow: 'none',
  },
});

const StyledGrabber = styled(Box, {
  cursor: 'grab',
  position: 'absolute',
  left: 0,
  display: 'flex',
  alignItems: 'center',
  width: '$4',
  height: '100%',
  color: '$textSubtle',
  opacity: 0,
  '&:hover': {
    opacity: 1,
  },
});

const StyledCheckbox = styled(Box, {
  position: 'absolute',
  right: '$4',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  variants: {
    checked: {
      true: {
        opacity: 1,
      },
      indeterminate: {
        opacity: 1,
      },
      false: {
        opacity: 0,
        '&:hover, &:focus': {
          opacity: 1,
        },
      },
    },
  },
});

const StyledButton = styled('button', {
  padding: '$3 $4',
  display: 'flex',
  width: '100%',
  '&:hover, &:focus': {
    boxShadow: 'none',
    [`+ ${StyledCheckbox}`]: {
      opacity: 1,
    },
    [`~ ${StyledGrabber}`]: {
      opacity: 1,
    },
  },
  variants: {
    isActive: {
      true: {
        backgroundColor: '$bgAccent',
        borderColor: '$interaction',
      },
      false: {
        '&:focus, &:hover': {
          background: '$bgSubtle',
        },
      },
    },
    itemType: {
      folder: {
        cursor: 'default',
        '&:hover, &:focus': {
          backgroundColor: 'inherit',
        },
      },
    },
  },
});

const StyledWrapper = styled(Box, {
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  gap: '$1',
  fontWeight: '$bold',
  fontSize: '$xsmall',
});

const ConditionalReorderWrapper = ({
  canReorder,
  controls,
  item,
  children,
  onReorder,
}: {
  canReorder: boolean;
  controls: any;
  item: TreeItem;
  children: React.ReactElement;
  onReorder: () => void;
}) => {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  return canReorder ? (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      onDragEnd={(e) => {
        onReorder();
        e.preventDefault();
      }}
      value={item}
      style={{ boxShadow, y }}
    >
      {children}
    </Reorder.Item>
  ) : (
    children
  );
};

export function TokenSetItem2({
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
}: TokenSetItemProps) {
  const controls = useDragControls();

  return (
    <ConditionalReorderWrapper canReorder={canReorder} item={item} controls={controls} onReorder={() => onReorder()}>
      <StyledWrapper>
        {item.type === 'folder' ? (
          <ChevronButton
            css={{
              left: `${5 * item.level}px`,
            }}
            onClick={() => (onCollapse ? onCollapse() : null)}
            type="button"
          >
            <StyledChevron collapsed={isCollapsed}>
              <IconChevronDown />
            </StyledChevron>
          </ChevronButton>
        ) : null}
        {item.type === 'folder' ? (
          <StyledButton itemType={item.type} type="button" isActive={isActive} onClick={() => onClick()}>
            <Box css={{
              paddingLeft: `${5 * item.level}px`, color: '$textMuted', fontWeight: '$normal', userSelect: 'none',
            }}
            >
              {item.label}
            </Box>
          </StyledButton>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger asChild id={`${item.path}-trigger`}>
              <StyledButton itemType={item.type} type="button" isActive={isActive} onClick={() => onClick()}>
                <Box css={{ paddingLeft: `${5 * item.level}px`, userSelect: 'none' }}>{item.label}</Box>
              </StyledButton>
            </ContextMenuTrigger>
            {canEdit ? (
              <ContextMenuContent>
                <ContextMenuItem onSelect={() => onRename(item.path)}>Rename</ContextMenuItem>
                <ContextMenuItem disabled={!canDelete} onSelect={() => onDelete(item.path)}>
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            ) : null}
          </ContextMenu>
        )}

        <StyledCheckbox checked={isChecked}>
          <Checkbox size="small" checked={isChecked} id={item.path} onCheckedChange={() => onCheck(!isChecked)} />
        </StyledCheckbox>
        {canReorder ? (
          <StyledGrabber onPointerDown={(e) => controls.start(e)}>
            <IconGrabber />
          </StyledGrabber>
        ) : null}
      </StyledWrapper>
    </ConditionalReorderWrapper>
  );
}
