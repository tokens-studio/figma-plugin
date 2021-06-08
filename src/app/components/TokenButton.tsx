import * as React from 'react';
import {track} from '@/utils/analytics';
import {useDispatch, useSelector} from 'react-redux';
import Tooltip from './Tooltip';
import MoreButton from './MoreButton';
import {useTokenDispatch} from '../store/TokenContext';
import {lightOrDark, isTypographyToken} from './utils';
import useManageTokens from '../store/useManageTokens';
import {Dispatch, RootState} from '../store';
import {DEFAULT_DEPTH_LEVEL} from './constants';
import useTokens from '../store/useTokens';

const TokenButton = ({type, property, token, editMode, showForm}) => {
    const uiState = useSelector((state: RootState) => state.uiState);
    const {activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {setNodeData, getTokenValue} = useTokens();
    const {setShowOptions} = useTokenDispatch();
    const {deleteSingleToken} = useManageTokens();
    const dispatch = useDispatch<Dispatch>();
    const {isAlias} = useTokens();

    const displayValue = getTokenValue(token);
    let style;
    let showValue = true;
    let showEditButton = false;
    let properties = [type];
    const {name} = token;
    // Only show the last part of a token in a group
    const visibleDepth = 1;
    const visibleName = name.split('.').slice(-visibleDepth).join('.');
    const buttonClass = [];

    const handleEditClick = () => {
        setShowOptions(property);
        showForm({name, value: token, path: name});
    };

    const handleDeleteClick = () => {
        deleteSingleToken({parent: activeTokenSet, path: name});
    };

    function setPluginValue(value) {
        dispatch.uiState.setLoading(true);
        setNodeData(value);
    }

    switch (type) {
        case 'borderRadius':
            style = {...style, borderRadius: `${displayValue}px`};
            properties = [
                {
                    label: 'All',
                    name: 'borderRadius',
                    clear: [
                        'borderRadiusTopLeft',
                        'borderRadiusTopRight',
                        'borderRadiusBottomRight',
                        'borderRadiusBottomLeft',
                    ],
                },
                {label: 'Top Left', name: 'borderRadiusTopLeft'},
                {label: 'Top Right', name: 'borderRadiusTopRight'},
                {label: 'Bottom Right', name: 'borderRadiusBottomRight'},
                {label: 'Bottom Left', name: 'borderRadiusBottomLeft'},
            ];
            break;
        case 'spacing':
            properties = [
                {
                    label: 'All',
                    icon: 'Spacing',
                    name: 'spacing',
                    clear: [
                        'horizontalPadding',
                        'verticalPadding',
                        'itemSpacing',
                        'paddingLeft',
                        'paddingRight',
                        'paddingTop',
                        'paddingBottom',
                    ],
                },
                {label: 'Top', name: 'paddingTop'},
                {label: 'Right', name: 'paddingRight'},
                {label: 'Bottom', name: 'paddingBottom'},
                {label: 'Left', name: 'paddingLeft'},
                {label: 'Gap', name: 'itemSpacing', icon: 'Gap'},
            ];
            break;
        case 'sizing':
            properties = [
                {
                    label: 'All',
                    name: 'sizing',
                    clear: ['width', 'height'],
                },
                {label: 'Width', name: 'width'},
                {label: 'Height', name: 'height'},
            ];
            break;
        case 'color':
            showValue = false;
            properties = [
                {
                    label: 'Fill',
                    name: 'fill',
                },
                {
                    label: 'Border',
                    name: 'border',
                },
            ];

            style = {
                '--backgroundColor': displayValue,
                '--borderColor': lightOrDark(displayValue) === 'light' ? '#f5f5f5' : 'white',
            };
            buttonClass.push('button-property-color');
            if (uiState.displayType === 'LIST') {
                buttonClass.push('button-property-color-listing');
                showValue = true;
                if (!editMode) showEditButton = true;
            }
            break;
        default:
            break;
    }

    properties = [
        ...properties,
        {
            label: 'Insert name (text)',
            name: 'tokenName',
        },
        {
            label: 'Insert raw value (text)',
            name: 'tokenValue',
        },
        {
            label: 'Insert description (text)',
            name: 'description',
        },
    ];

    const active = uiState.selectionValues[type] === name;
    const semiActive = properties.some((prop) => uiState.selectionValues[prop.name] === name);

    if (editMode) {
        buttonClass.push('button-edit');
    }
    if (active) {
        buttonClass.push('button-active');
    } else if (semiActive) {
        buttonClass.push('button-semi-active');
    }

    const onClick = (givenProperties, isActive = active) => {
        const propsToSet = Array.isArray(givenProperties) ? givenProperties : new Array(givenProperties);
        if (editMode) {
            showForm({name, value: token, path: name});
        } else {
            const tokenValue = name;
            track('Apply Token', {givenProperties});
            let value = isActive ? 'delete' : tokenValue;
            if (propsToSet[0].clear && !active) {
                value = 'delete';
                propsToSet[0].forcedValue = tokenValue;
            }
            const newProps = {
                [propsToSet[0].name || propsToSet[0]]: propsToSet[0].forcedValue || value,
            };
            if (propsToSet[0].clear) propsToSet[0].clear.map((item) => Object.assign(newProps, {[item]: 'delete'}));
            setPluginValue(newProps);
        }
    };

    const getTokenDisplay = (tokenVal) => {
        const valueToCheck = tokenVal.value ?? tokenVal;
        if (isTypographyToken(valueToCheck)) {
            return `${valueToCheck.fontFamily} / ${valueToCheck.fontWeight}`;
        }
        if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
            return JSON.stringify(valueToCheck, null, 2);
        }

        return valueToCheck;
    };

    return (
        <div
            className={`relative mb-1 mr-1 flex button button-property ${buttonClass.join(' ')} ${
                uiState.disabled && 'button-disabled'
            } `}
            style={style}
        >
            <MoreButton
                properties={properties}
                onClick={onClick}
                onDelete={handleDeleteClick}
                onEdit={handleEditClick}
                value={name}
                path={name}
                mode={editMode ? 'edit' : 'list'}
            >
                <Tooltip
                    label={
                        <div>
                            <div className="text-gray-500 uppercase font-bold text-xs">
                                {token.name.split('.')[token.name.split('.').length - 1]}
                            </div>
                            <div className="text-white">{getTokenDisplay(token)}</div>
                            {isAlias(token) && <div className="text-gray-600">{getTokenValue(token)}</div>}
                            {token.description && <div className="text-gray-500">{token.description}</div>}
                        </div>
                    }
                >
                    <button className="w-full h-full" type="button" onClick={() => onClick(properties[0])}>
                        <div className="button-text">{showValue && <span>{visibleName}</span>}</div>
                        {editMode && <div className="button-edit-overlay">Edit</div>}
                    </button>
                </Tooltip>
            </MoreButton>
            {showEditButton && (
                <Tooltip label="Edit Token">
                    <button
                        className="ml-auto button button-ghost button-property-edit"
                        type="button"
                        onClick={handleEditClick}
                    >
                        <Icon name="edit" />
                    </button>
                </Tooltip>
            )}
        </div>
    );
};

export default TokenButton;
