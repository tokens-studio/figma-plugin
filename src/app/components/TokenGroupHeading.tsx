import React from 'react';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import Heading from './Heading';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';

export default function TokenGroupHeading({label, path, id}) {
    const {editProhibited, activeTokenSet} = useTokenState();
    const {deleteToken} = useTokenDispatch();

    const onDelete = () => {
        deleteToken({parent: activeTokenSet, path});
    };

    return (
        <div>
            <ContextMenuTrigger id={`group-heading-${path}-${label}-${id}`}>
                <Heading size="small">
                    {label} {path}
                </Heading>
            </ContextMenuTrigger>
            <ContextMenu id={`group-heading-${path}-${label}-${id}`} className="text-xs">
                <MenuItem disabled={editProhibited} onClick={onDelete}>
                    Delete
                </MenuItem>
            </ContextMenu>
        </div>
    );
}
