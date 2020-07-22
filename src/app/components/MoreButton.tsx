import * as React from 'react';
import {Menu, MenuList, MenuButton, MenuItem} from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import Icon from './Icon';
import {useTokenState} from '../store/TokenContext';

const MoreButton = ({properties, disabled, path, value, onClick}) => {
    const {state} = useTokenState();
    return (
        <div>
            <Menu>
                {({isExpanded}) => (
                    <>
                        <MenuButton disabled={disabled} className="button-extra">
                            <span aria-hidden="true">{isExpanded ? '⏶' : '⏷'}</span>
                        </MenuButton>
                        <MenuList>
                            {properties.map((property) => {
                                const isActive = state.selectionValues[property.name] === `${path}.${value}`;

                                return (
                                    <MenuItem key={property.label} onSelect={() => onClick([property.name], isActive)}>
                                        {property.icon && (
                                            <div className="mr-2">
                                                <Icon name={property.icon} />
                                            </div>
                                        )}
                                        {isActive && '✔'}
                                        {property.label}
                                    </MenuItem>
                                );
                            })}
                        </MenuList>
                    </>
                )}
            </Menu>
        </div>
    );
};

export default MoreButton;
