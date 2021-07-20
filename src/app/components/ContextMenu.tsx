import {styled} from '@/stitches.config';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';

const StyledContent = styled(ContextMenuPrimitive.Content, {
    minWidth: 100,
    backgroundColor: '$contextMenuBackground',
    borderRadius: '$contextMenu',
    overflow: 'hidden',
    padding: 5,
    boxShadow: '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
});

const itemStyles = {
    all: 'unset',
    fontSize: 11,
    lineHeight: 1,
    color: '$contextMenuForeground',
    borderRadius: '$contextMenuItem',
    display: 'flex',
    alignItems: 'center',
    height: 20,
    padding: '0 4px',
    position: 'relative',
    paddingLeft: 16,
    userSelect: 'none',

    '&[data-disabled]': {
        color: '$interactionDisabled',
        pointerEvents: 'none',
    },

    '&:focus': {
        backgroundColor: '$interaction',
        color: '$onInteraction',
    },
};

const StyledItem = styled(ContextMenuPrimitive.Item, {...itemStyles});
const StyledCheckboxItem = styled(ContextMenuPrimitive.CheckboxItem, {...itemStyles});
const StyledRadioItem = styled(ContextMenuPrimitive.RadioItem, {...itemStyles});
const StyledTriggerItem = styled(ContextMenuPrimitive.TriggerItem, {
    '&[data-state="open"]': {
        backgroundColor: '$interaction',
        color: '$onInteraction',
    },
    ...itemStyles,
});

const StyledLabel = styled(ContextMenuPrimitive.Label, {
    paddingLeft: 16,
    fontSize: 11,
    lineHeight: '25px',
    color: '$contextMenuForeground',
});

const StyledSeparator = styled(ContextMenuPrimitive.Separator, {
    height: 1,
    backgroundColor: '$contextMenuSeperator',
    margin: 4,
});

const StyledItemIndicator = styled(ContextMenuPrimitive.ItemIndicator, {
    position: 'absolute',
    left: 0,
    width: 16,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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
