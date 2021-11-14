import * as React from 'react';
import {styled} from '@/stitches.config';
import {useSelector} from 'react-redux';
import {CheckIcon, ChevronRightIcon} from '@radix-ui/react-icons';
import {RootState} from '../store';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuCheckboxItem,
    ContextMenuItemIndicator,
    ContextMenuTriggerItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from './ContextMenu';

const RightSlot = styled('div', {
    marginLeft: 'auto',
    paddingLeft: 16,
    color: '$contextMenuForeground',
    ':focus > &': {color: 'white'},
    '[data-disabled] &': {color: '$disabled'},
});

const MoreButton = ({properties, children, path, value, onClick, onEdit, onDelete, onDuplicate}) => {
    const {selectionValues} = useSelector((state: RootState) => state.uiState);
    const {editProhibited} = useSelector((state: RootState) => state.tokenState);

    const extraProperties = [
        {
            label: 'Name',
            name: 'tokenName',
            clear: ['tokenValue', 'value', 'description'],
        },
        {
            label: 'Raw value',
            name: 'tokenValue',
            clear: ['tokenName', 'value', 'description'],
        },
        {
            label: 'Value',
            name: 'value',
            clear: ['tokenName', 'tokenValue', 'description'],
        },
        {
            label: 'Description',
            name: 'description',
            clear: ['tokenName', 'tokenValue', 'value'],
        },
    ];

    const visibleProperties = properties.filter((p) => p.label);

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger as="div" id={`${path}-${value}`}>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent sideOffset={5} collisionTolerance={30}>
                    {visibleProperties.map((property) => {
                        const isActive = selectionValues[property.name] === value;

                        return (
                            <ContextMenuCheckboxItem
                                key={property.label}
                                checked={isActive}
                                onCheckedChange={() => onClick(property, isActive)}
                            >
                                <ContextMenuItemIndicator>
                                    <CheckIcon />
                                </ContextMenuItemIndicator>
                                {property.label}
                            </ContextMenuCheckboxItem>
                        );
                    })}
                    <ContextMenu>
                        <ContextMenuTriggerItem>
                            Documentation Tokens
                            <RightSlot>
                                <ChevronRightIcon />
                            </RightSlot>
                        </ContextMenuTriggerItem>
                        <ContextMenuContent sideOffset={2} alignOffset={-5} collisionTolerance={30}>
                            {extraProperties.map((property) => {
                                const isActive = selectionValues[property.name] === value;

                                return (
                                    <ContextMenuCheckboxItem
                                        key={property.label}
                                        checked={isActive}
                                        onCheckedChange={() => onClick(property, isActive)}
                                    >
                                        <ContextMenuItemIndicator>
                                            <CheckIcon />
                                        </ContextMenuItemIndicator>
                                        {property.label}
                                    </ContextMenuCheckboxItem>
                                );
                            })}
                        </ContextMenuContent>
                    </ContextMenu>
                    <ContextMenuSeparator />

                    <ContextMenuItem onSelect={onEdit} disabled={editProhibited}>
                        Edit Token
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={onDuplicate} disabled={editProhibited}>
                        Duplicate Token
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={onDelete} disabled={editProhibited}>
                        Delete Token
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>
    );
};

export default MoreButton;
