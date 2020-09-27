import * as React from 'react';
import {ContextMenu, MenuItem, ContextMenuTrigger} from 'react-contextmenu';
import Icon from './Icon';
import {useTokenState} from '../store/TokenContext';

const MoreButton = ({properties, children, path, value, onClick, onEdit}) => {
    const {state} = useTokenState();
    const visibleProperties = properties.filter((p) => p.label);

    return (
        <div className="w-full">
            <ContextMenuTrigger id={`${path}-${value}`}>{children}</ContextMenuTrigger>
            <ContextMenu id={`${path}-${value}`} className="text-xs">
                {visibleProperties.map((property) => {
                    const isActive = state.selectionValues[property.name] === `${path}.${value}`;

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
                <MenuItem onClick={() => onEdit()}>Edit Token</MenuItem>
            </ContextMenu>
        </div>
    );
};

export default MoreButton;
