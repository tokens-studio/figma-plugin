import * as React from 'react';
import {ContextMenu, MenuItem, ContextMenuTrigger} from 'react-contextmenu';
import Icon from './Icon';
import {useTokenState} from '../store/TokenContext';

const MoreButton = ({properties, children, path, value, onClick, onEdit, onDelete, mode}) => {
    const {selectionValues, editProhibited} = useTokenState();
    const visibleProperties = properties.filter((p) => p.label);

    return (
        <div className="w-full">
            <ContextMenuTrigger id={`${path}-${value}-${mode}`}>{children}</ContextMenuTrigger>
            <ContextMenu id={`${path}-${value}-${mode}`} className="text-xs">
                {visibleProperties.map((property) => {
                    const isActive = selectionValues[property.name] === `${path}.${value}`;

                    return (
                        <MenuItem key={property.label} onClick={() => onClick([property.name], isActive)}>
                            <div className="flex items-center">
                                {property.icon && (
                                    <div className="mr-2 text-white">
                                        <Icon name={property.icon} />
                                    </div>
                                )}
                                {isActive && '✔'}
                                {property.label}
                            </div>
                        </MenuItem>
                    );
                })}
                {visibleProperties?.length > 1 && <MenuItem divider />}
                <MenuItem onClick={onEdit} disabled={editProhibited}>
                    Edit Token
                </MenuItem>
                <MenuItem onClick={onDelete} disabled={editProhibited}>
                    Delete Token
                </MenuItem>
            </ContextMenu>
        </div>
    );
};

export default MoreButton;
