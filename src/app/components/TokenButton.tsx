import * as React from 'react';
import Tooltip from './Tooltip';
import MoreButton from './MoreButton';
import {useTokenState} from '../store/TokenContext';
import Icon from './Icon';

function lightOrDark(color) {
    // Variables for red, green, blue values
    let r;
    let g;
    let b;
    let hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
        // If RGB --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

        r = color[1];
        g = color[2];
        b = color[3];
    } else {
        // If hex --> Convert it to RGB: http://gist.github.com/983661
        color = +`0x${color.slice(1).replace(color.length < 5 && /./g, '$&$&')}`;

        r = color >> 16;
        g = (color >> 8) & 255;
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 245.5) {
        return 'light';
    }

    return 'dark';
}

function colorByHashCode(value) {
    let hash = 0;
    if (value.length === 0) return hash;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) * 30 + hash;
    }
    const shortened = Math.abs(hash % 360);
    return `${shortened},100%,85%`;
}

const TokenButton = ({type, name, path, token, disabled, editMode, showForm}) => {
    const {state, setSelectionValues, setNodeData, setShowOptions} = useTokenState();
    const realTokenValue = state.tokenData.getAliasValue(token);
    const displayValue = realTokenValue || token;
    let style;
    let showValue = true;
    let showEditButton = false;
    let properties = [type];
    const buttonClass = [];
    const active = state.selectionValues[type] === [path, name].join('.');

    const handleEditClick = () => {
        setShowOptions(path);
        showForm({name, token, path});
    };

    function setPluginValue(value) {
        setSelectionValues(value);
        const newPluginValue = {
            ...state.selectionValue,
            ...value,
        };
        setNodeData(newPluginValue);
    }

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
    if (state.colorMode) {
        style = {
            '--bgColor': colorByHashCode(name.toString()),
            backgroundColor: 'hsl(var(--bgColor))',
        };
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
            if (state.displayType === 'LIST') {
                buttonClass.push('button-property-color-listing');
                showValue = true;
                if (!editMode) showEditButton = true;
            }

            if (active) {
                buttonClass.push('button-active-fill');
            }
            break;
        default:
            break;
    }

    return (
        <div
            className={`relative mb-1 mr-1 flex button button-property ${buttonClass.join(' ')} ${
                disabled && 'button-disabled'
            } `}
            style={style}
        >
            <MoreButton properties={properties} onClick={onClick} onEdit={handleEditClick} value={name} path={path}>
                <Tooltip
                    label={`${name}: ${JSON.stringify(token, null, 2)}${realTokenValue ? `: ${realTokenValue}` : ''}`}
                >
                    <button
                        className="w-full h-full"
                        disabled={editMode ? false : disabled}
                        type="button"
                        onClick={() => onClick(properties)}
                    >
                        <div className="button-text">{showValue && <span>{name}</span>}</div>
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
