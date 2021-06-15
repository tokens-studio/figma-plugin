import * as React from 'react';
import {track} from '@/utils/analytics';
import {useDispatch, useSelector} from 'react-redux';
import Tooltip from './Tooltip';
import MoreButton from './MoreButton';
import {lightOrDark} from './utils';
import useManageTokens from '../store/useManageTokens';
import {Dispatch, RootState} from '../store';
import useTokens from '../store/useTokens';

const TokenButton = ({type, token, editMode, showForm, resolvedTokens}) => {
    const uiState = useSelector((state: RootState) => state.uiState);
    const {activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {setNodeData, getTokenValue, getTokenDisplay} = useTokens();
    const {deleteSingleToken} = useManageTokens();
    const dispatch = useDispatch<Dispatch>();
    const {isAlias} = useTokens();

    const displayValue = getTokenValue(token, resolvedTokens);

    let style;
    let showValue = true;
    let properties = [type];
    const {name} = token;
    // Only show the last part of a token in a group
    const visibleDepth = 1;
    const visibleName = name.split('.').slice(-visibleDepth).join('.');
    const buttonClass = [];

    const handleEditClick = () => {
        showForm({name, value: token.value, path: name});
    };

    const handleDeleteClick = () => {
        deleteSingleToken({parent: activeTokenSet, path: name});
    };

    function setPluginValue(value) {
        console.log('setting plugin data', value, resolvedTokens);
        dispatch.uiState.setLoading(true);
        setNodeData(value, resolvedTokens);
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
                            <div className="text-white">{getTokenDisplay(token, resolvedTokens)}</div>
                            {isAlias(token, resolvedTokens) && (
                                <div className="text-gray-600">{getTokenValue(token, resolvedTokens)}</div>
                            )}
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
        </div>
    );
};

export default TokenButton;
