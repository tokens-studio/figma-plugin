import * as React from 'react';
import Tooltip from './Tooltip';
import MoreButton from './MoreButton';
import {useTokenState} from '../store/TokenContext';

function colorByHashCode(value) {
    let hash = 0;
    if (value.length === 0) return hash;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) * 30 + hash;
    }
    const shortened = Math.abs(hash % 360);
    return `${shortened},100%,85%`;
}

const TokenButton = ({type, name, path, token, disabled, editMode, setPluginValue, showForm}) => {
    const {state} = useTokenState();
    const realTokenValue = state.tokenData.getAliasValue(token);
    const displayValue = realTokenValue || token;
    let style;
    const showValue = true;
    let properties = [type];
    const buttonClass = [];
    const active = state.selectionValues[type] === [path, name].join('.');
    if (editMode) {
        buttonClass.push('button-edit');
    }
    if (active) {
        buttonClass.push('button-active');
    }
    const onClick = (givenProperties, isActive = active) => {
        const propsToSet = givenProperties;
        if (editMode) {
            showForm({name, token, path});
        } else {
            const tokenValue = [path, name].join('.');
            let value = isActive ? 'delete' : tokenValue;
            if (propsToSet[0].clear && !active) {
                value = 'delete';
                propsToSet[0].forcedValue = tokenValue;
            }
            const newProps = givenProperties
                .map((i) => [[i.name || i], i.forcedValue || value])
                .reduce((acc, [key, val]) => ({...acc, [key]: val}), {});
            setPluginValue(newProps);
        }
    };
    style = {
        '--bgColor': colorByHashCode(name.toString()),
        backgroundColor: 'hsl(var(--bgColor))',
    };
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
        case 'opacity':
            style = {
                ...style,
                backgroundColor: `rgba(0,0,0, ${Number(displayValue.slice(0, displayValue.length - 1)) / 100})`,
            };
            break;
        case 'spacing':
            properties = [
                {
                    label: 'All',
                    icon: 'Spacing',
                    name: 'spacing',
                    clear: ['horizontalPadding', 'verticalPadding', 'itemSpacing'],
                },
                {label: 'Horizontal', name: 'horizontalPadding', icon: 'HorizontalPadding'},
                {label: 'Vertical', name: 'verticalPadding', icon: 'VerticalPadding'},
                {label: 'Gap', name: 'itemSpacing', icon: 'Gap'},
            ];
            break;
        case 'fill':
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
            };
            buttonClass.push('button-property-color');

            if (active) {
                buttonClass.push('button-active-fill');
            }
            break;
        default:
            break;
    }

    if (!editMode && properties.length > 1) {
        buttonClass.push('button-has-extras');
    }

    return (
        <Tooltip label={`${name}: ${token}${realTokenValue ? `: ${realTokenValue}` : ''}`}>
            <div
                className={`relative flex button button-property ${buttonClass.join(' ')} ${
                    disabled && 'button-disabled'
                } `}
                style={style}
            >
                <button
                    className="w-full h-full"
                    disabled={editMode ? false : disabled}
                    type="button"
                    onClick={() => onClick(properties)}
                >
                    <div className="button-text">{showValue ? name : <span className="px-3" />}</div>
                    {editMode && <div className="button-edit-overlay">Edit</div>}
                </button>
                {!editMode && properties.length > 1 && (
                    <MoreButton
                        disabled={disabled}
                        properties={properties}
                        onClick={onClick}
                        value={name}
                        path={path}
                    />
                )}
            </div>
        </Tooltip>
    );
};

export default TokenButton;
