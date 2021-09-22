import React from 'react';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import {useDispatch, useSelector} from 'react-redux';
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
        <div>
            <ContextMenuTrigger id={`group-heading-${path}-${label}-${id}`}>
                <Heading size="small">{label}</Heading>
            </ContextMenuTrigger>
            <ContextMenu id={`group-heading-${path}-${label}-${id}`} className="text-xs">
                <MenuItem disabled={editProhibited} onClick={onDelete}>
                    Delete
                </MenuItem>
            </ContextMenu>
        </div>
    );
}
