import * as React from 'react';

const PropertyButton = ({property, disabled, name, value, chooseTarget, unsetTarget}) => (
    <div className={`button-group ${value ? 'button-group-active' : ''}`}>
        <button
            disabled={disabled}
            type="button"
            className="button"
            name={property}
            onClick={() => chooseTarget({name, property})}
        >
            <div>{name}</div>
            <div className="button-value">{value}</div>
        </button>
        {value && (
            <button type="button" className="button" name={property} onClick={() => unsetTarget(property)}>
                x
            </button>
        )}
    </div>
);

export default PropertyButton;
