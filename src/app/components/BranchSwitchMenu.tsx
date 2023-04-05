import * as BranchSwitchMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { styled } from '@/stitches.config';

const itemStyles = {
  fontSize: '$xsmall',
  padding: '$2 $3 $2 $2',
  borderRadius: '$contextMenuItem',
  cursor: 'default',
  userselect: 'none',
  display: 'flex',

  '&:hover:not([data-disabled]), &:focus:not([data-disabled])': {
    outline: 'none',
    backgroundColor: '$interaction',
    color: '$onInteraction',
  },

  '&[data-disabled]': {
    color: '$contextMenuForegroundDisabled',
  },
};

const StyledBranchSwitchMenuContent = styled(BranchSwitchMenuPrimitive.Content, {
  minWidth: 180,
  backgroundColor: '$contextMenuBackground',
  color: '$contextMenuForeground',
  borderRadius: '$contextMenu',
  padding: '$2',
  boxShadow: '$contextMenu',
});

const StyledBranchSwitchMenuCheckboxItem = styled(BranchSwitchMenuPrimitive.CheckboxItem, itemStyles);
const StyledBranchSwitchMenuItem = styled(BranchSwitchMenuPrimitive.Item, { ...itemStyles, paddingLeft: '$6' });

const StyledBranchSwitchMenuItemIndicator = styled(BranchSwitchMenuPrimitive.ItemIndicator, {});

const StyledBranchSwitchMenuSeparator = styled(BranchSwitchMenuPrimitive.Separator, {
  height: '1px',
  backgroundColor: '$contextMenuSeperator',
  margin: '$2',
});

const StyledBranchSwitchMenuMainTrigger = styled(BranchSwitchMenuPrimitive.Trigger, {
  display: 'flex',
  alignItems: 'center',
  fontSize: '$xsmall',
  borderRadius: '$button',
  padding: '$3',

  '& > span': {
    paddingLeft: '$2',
    paddingRight: '$2',
  },

  '&:hover': {
    background: '$bgSubtle',
  },
  '&:focus': {
    outline: '$focus',
  },
});

const StyledBranchSwitchMenuTrigger = styled(BranchSwitchMenuPrimitive.Trigger, {
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '$6',
  paddingRight: '$3',
  paddingTop: '$2',
  paddingBottom: '$2',
  gap: '$1',
  borderRadius: '$button',
  backgroundColor: '$contextMenuBackground',
  color: '$contextMenuForeground',
  fontSize: '$xsmall',

  '&:hover:not([disabled]), &:focus:not([disabled])': {
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '$interaction',
    borderColor: '$border',
  },

  '&[data-state="open"]': {
    backgroundColor: '$interaction',
    color: '$onInteraction',
  },

  variants: {
    bordered: {
      true: {
        border: '1px solid $borderMuted',
      },
    },
  },
});

const StyledBranchSwitchSubmenu = styled(BranchSwitchMenuPrimitive.DropdownMenuGroup, {
  position: 'absolute',
  left: '$2',
});

const StyledBranchSwitchMenuRadioGroup = styled(BranchSwitchMenuPrimitive.RadioGroup, {});

const StyledBranchSwitchMenuRadioItem = styled(BranchSwitchMenuPrimitive.RadioItem, itemStyles);

const StyledBranchSwitchMenuArrow = styled(BranchSwitchMenuPrimitive.Arrow, { fill: '$contextMenuBackground' });

const StyledBranchSwitchMenu = styled(BranchSwitchMenuPrimitive.Root, {});

export const BranchSwitchMenuContent = StyledBranchSwitchMenuContent;
export const BranchSwitchMenuCheckboxItem = StyledBranchSwitchMenuCheckboxItem;
export const BranchSwitchMenuRadioGroup = StyledBranchSwitchMenuRadioGroup;
export const BranchSwitchMenuRadioItem = StyledBranchSwitchMenuRadioItem;
export const BranchSwitchMenuMainTrigger = StyledBranchSwitchMenuMainTrigger;
export const BranchSwitchMenuTrigger = StyledBranchSwitchMenuTrigger;
export const BranchSwitchMenuSeparator = StyledBranchSwitchMenuSeparator;
export const BranchSwitchMenuItem = StyledBranchSwitchMenuItem;
export const BranchSwitchMenuItemIndicator = StyledBranchSwitchMenuItemIndicator;
export const BranchSwitchMenu = StyledBranchSwitchMenu;
export const BranchSwitchSubmenu = StyledBranchSwitchSubmenu;
export const BranchSwitchMenuArrow = StyledBranchSwitchMenuArrow;
