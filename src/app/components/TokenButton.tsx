import * as React from 'react';
import {track} from '@/utils/analytics';
import {useDispatch, useSelector} from 'react-redux';
import {SingleTokenObject} from 'Types/tokens';
import getAliasValue from '@/utils/aliases';
import Tooltip from './Tooltip';
import MoreButton from './MoreButton';
import {lightOrDark} from './utils';
import useManageTokens from '../store/useManageTokens';
import {Dispatch, RootState} from '../store';
import useTokens from '../store/useTokens';
import TokenTooltip from './TokenTooltip';
import BrokenReferenceIndicator from './BrokenReferenceIndicator';

export function useGetActiveState(properties, type, name) {
    const uiState = useSelector((state: RootState) => state.uiState);

    return (
        uiState.selectionValues[type] === name ||
        properties.some((prop) => {
            return uiState.selectionValues[prop.name] === name;
        })
    );
}

const TokenButton = ({
    type,
    token,
    showForm,
    resolvedTokens,
}: {
    type: string | object;
    token: SingleTokenObject;
    showForm: Function;
    resolvedTokens: SingleTokenObject[];
}) => {
    const uiState = useSelector((state: RootState) => state.uiState);
    const {activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {setNodeData} = useTokens();
    const {deleteSingleToken, duplicateSingleToken} = useManageTokens();
    const dispatch = useDispatch<Dispatch>();
    const {isAlias} = useTokens();

    const displayValue = getAliasValue(token, resolvedTokens);

    let style;
    let showValue = true;
    let properties = [type];
    const {name} = token;
    // Only show the last part of a token in a group
    const visibleDepth = 1;
    const visibleName = name.split('.').slice(-visibleDepth).join('.');
    const buttonClass = [];

    const handleEditClick = () => {
        showForm({name, token});
    };

    const handleDeleteClick = () => {
        deleteSingleToken({parent: activeTokenSet, path: name});
    };
    const handleDuplicateClick = () => {
        duplicateSingleToken({parent: activeTokenSet, name});
    };

    function setPluginValue(value) {
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
                {label: 'Gap', name: 'itemSpacing', icon: 'Gap'},
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
                '--borderColor': lightOrDark(displayValue) === 'light' ? '#e7e7e7' : 'white',
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

    const documentationProperties = [
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

    const active = useGetActiveState([...properties, ...documentationProperties], type, name);

    if (active) {
        buttonClass.push('button-active');
    }

    const onClick = (givenProperties, isActive = active) => {
        const propsToSet = Array.isArray(givenProperties) ? givenProperties : new Array(givenProperties);

        const tokenValue = name;
        track('Apply Token', {givenProperties});
        let value = isActive ? 'delete' : tokenValue;
        if (propsToSet[0].clear && !isActive) {
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
            className={`relative mb-1 mr-1 button button-property ${buttonClass.join(' ')} ${
                uiState.disabled && 'button-disabled'
            } `}
            style={style}
        >
            <MoreButton
                properties={properties}
                documentationProperties={documentationProperties}
                onClick={onClick}
                onDelete={handleDeleteClick}
                onDuplicate={handleDuplicateClick}
                onEdit={handleEditClick}
                value={name}
                path={name}
            >
                <Tooltip
                    side="bottom"
                    label={
                        <div>
                            <div className="text-gray-500 font-bold text-xs">
                                {token.name.split('.')[token.name.split('.').length - 1]}
                            </div>
                            <TokenTooltip token={token} resolvedTokens={resolvedTokens} />
                            {isAlias(token, resolvedTokens) && (
                                <div className="text-gray-400">
                                    <TokenTooltip token={token} resolvedTokens={resolvedTokens} shouldResolve />
                                </div>
                            )}
                            {token.description && <div className="text-gray-500">{token.description}</div>}
                        </div>
                    }
                >
                    <button
                        style={style}
                        className="w-full h-full relativeƒ"
                        type="button"
                        onClick={() => onClick(properties[0])}
                    >
                        <BrokenReferenceIndicator token={token} resolvedTokens={resolvedTokens} />

                        <div className="button-text">{showValue && <span>{visibleName}</span>}</div>
                    </button>
                </Tooltip>
            </MoreButton>
        </div>
    );
};

export default TokenButton;
