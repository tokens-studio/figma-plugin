import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { styled } from '@/stitches.config';

const StyledContent = styled(ContextMenuPrimitive.Content, {
  minWidth: 100,
  backgroundColor: '$contextMenuBg',
  border: '1px solid $contextMenuBorder',
  borderRadius: '$medium',
  overflow: 'hidden',
  padding: '$2',
  boxShadow: '$contextMenu',
});

const itemStyles = {
  all: 'unset',
  fontSize: '$xsmall',
  lineHeight: 1,
  color: '$contextMenuFg',
  borderRadius: '$small',
  display: 'flex',
  alignItems: 'center',
  height: 20,
  padding: '0 $2',
  paddingLeft: '$5',
  userSelect: 'none',

  '&[data-disabled]': {
    color: '$contextMenuFgDisabled',
    pointerEvents: 'none',
  },

  '&:focus': {
    backgroundColor: '$accentDefault',
    color: '$fgOnEmphasis',
  },
  '&:disabled': {
    pointerEvents: 'none',
    opacity: 0.5,
  },
};

const StyledItem = styled(ContextMenuPrimitive.Item, { ...itemStyles });
const StyledCheckboxItem = styled(ContextMenuPrimitive.CheckboxItem, { ...itemStyles });
const StyledRadioItem = styled(ContextMenuPrimitive.RadioItem, { ...itemStyles });
const StyledTriggerItem = styled(ContextMenuPrimitive.TriggerItem, {
  '&[data-state="open"]': {
    backgroundColor: '$accentDefault',
    color: '$fgOnEmphasis',
  },
  ...itemStyles,
});

const StyledLabel = styled(ContextMenuPrimitive.Label, {
  paddingLeft: '$3',
  fontSize: '$xsmall',
  lineHeight: '25px',
  color: '$contextMenuFg',
});

const StyledSeparator = styled(ContextMenuPrimitive.Separator, {
  height: '1px',
  backgroundColor: '$contextMenuSeperator',
  margin: '$2',
});

const StyledItemIndicator = styled(ContextMenuPrimitive.ItemIndicator, {
  position: 'absolute',
  left: '$2',
  width: '$5',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledArrow = styled(ContextMenuPrimitive.Arrow, {
  fill: 'white',
});

// Exports
export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuContent = StyledContent;
export const ContextMenuItem = StyledItem;
export const ContextMenuCheckboxItem = StyledCheckboxItem;
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
export const ContextMenuRadioItem = StyledRadioItem;
export const ContextMenuItemIndicator = StyledItemIndicator;
export const ContextMenuTriggerItem = StyledTriggerItem;
export const ContextMenuLabel = StyledLabel;
export const ContextMenuSeparator = StyledSeparator;
export const ContextMenuArrow = StyledArrow;
