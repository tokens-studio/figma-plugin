import * as PropertySwitchMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { styled, keyframes } from '@/stitches.config';

const itemStyles = {
  fontSize: '$xsmall',
  padding: '$2 $3 $2 $6',
  borderRadius: '$contextMenuItem',
  cursor: 'default',
  userselect: 'none',

  '&:focus': {
    outline: 'none',
    backgroundColor: '$interaction',
    color: '$onInteraction',
  },
};

const StyledPropertySwitchMenuContent = styled(PropertySwitchMenuPrimitive.Content, {
  minWidth: 180,
  maxHeight: '250px',
  overflow: 'auto',
  backgroundColor: '$bgSubtle',
  color: '$contextMenuBackground',
  borderRadius: '$contextMenu',
  padding: '$2',
  boxShadow: '$contextMenu',
});

const StyledPropertySwitchMenuCheckboxItem = styled(PropertySwitchMenuPrimitive.CheckboxItem, itemStyles);
const StyledPropertySwitchMenuItem = styled(PropertySwitchMenuPrimitive.Item, { ...itemStyles, paddingLeft: '$3' });

const StyledPropertySwitchMenuItemIndicator = styled(PropertySwitchMenuPrimitive.ItemIndicator, {
  position: 'absolute',
  left: '$2',
});

const StyledPropertySwitchMenuSeparator = styled(PropertySwitchMenuPrimitive.Separator, {
  height: '1px',
  backgroundColor: '$contextMenuSeperator',
  margin: '$2',
});

const StyledPropertySwitchMenuMainTrigger = styled(PropertySwitchMenuPrimitive.Trigger, {
  display: 'flex',
  flex: 1,
  fontSize: '$xsmall',
  borderRadius: '$1',
  justifyContent: 'center',
  padding: '$3 $1',
  border: '1px solid #e9e9e9',
  minHeight: '$10',
  marginRight: '$4',
  '& > span': {
    paddingLeft: '$2',
    paddingRight: '$2',
  },

  '&:hover': {
    background: '$PropertySwitchTriggerHover',
  },
});

const StyledPropertySwitchMenuTrigger = styled(PropertySwitchMenuPrimitive.Trigger, {
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

  '&:focus, &:hover': {
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

const StyledPropertySwitchSubmenu = styled(PropertySwitchMenuPrimitive.DropdownMenuGroup, {
  position: 'absolute',
  left: '$2',
});

const StyledPropertySwitchMenuRadioGroup = styled(PropertySwitchMenuPrimitive.RadioGroup, {});

const StyledPropertySwitchMenuRadioItem = styled(PropertySwitchMenuPrimitive.RadioItem, itemStyles);

const StyledPropertySwitchMenuArrow = styled(PropertySwitchMenuPrimitive.Arrow, { fill: 'black' });

const StyledPropertySwitchMenu = styled(PropertySwitchMenuPrimitive.Root, {});

export const PropertySwitchMenuContent = StyledPropertySwitchMenuContent;
export const PropertySwitchMenuCheckboxItem = StyledPropertySwitchMenuCheckboxItem;
export const PropertySwitchMenuRadioGroup = StyledPropertySwitchMenuRadioGroup;
export const PropertySwitchMenuRadioItem = StyledPropertySwitchMenuRadioItem;
export const PropertySwitchMenuMainTrigger = StyledPropertySwitchMenuMainTrigger;
export const PropertySwitchMenuTrigger = StyledPropertySwitchMenuTrigger;
export const PropertySwitchMenuSeparator = StyledPropertySwitchMenuSeparator;
export const PropertySwitchMenuItem = StyledPropertySwitchMenuItem;
export const PropertySwitchMenuItemIndicator = StyledPropertySwitchMenuItemIndicator;
export const PropertySwitchMenu = StyledPropertySwitchMenu;
export const PropertySwitchSubmenu = StyledPropertySwitchSubmenu;
export const PropertySwitchMenuArrow = StyledPropertySwitchMenuArrow;
