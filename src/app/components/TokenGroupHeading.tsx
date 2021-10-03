import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from './ContextMenu';
import Heading from './Heading';
import {Dispatch, RootState} from '../store';
import useConfirm from '../hooks/useConfirm';

export default function TokenGroupHeading({label, path, id}) {
    const {activeTokenSet, editProhibited} = useSelector((state: RootState) => state.tokenState);
    const {deleteTokenGroup} = useDispatch<Dispatch>().tokenState;
    const {confirm} = useConfirm();

    const onDelete = async () => {
        const userConfirmation = await confirm({
            text: 'Delete group?',
            description: 'Are you sure you want to delete this group?',
        });
        if (userConfirmation) {
            deleteTokenGroup({parent: activeTokenSet, path});
        }
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger id={`group-heading-${path}-${label}-${id}`}>
                <Heading size="small">{label}</Heading>
            </ContextMenuTrigger>
            <ContextMenuContent className="text-xs">
                <ContextMenuItem disabled={editProhibited} onClick={onDelete}>
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
