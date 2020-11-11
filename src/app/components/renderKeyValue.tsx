import * as React from 'react';
import Heading from './Heading';
import Icon from './Icon';
import TokenButton from './TokenButton';
import Tooltip from './Tooltip';
import {isTypographyToken} from './utils';

const renderKeyValue = ({
    tokenValues,
    showNewForm,
    showForm,
    property,
    schema,
    path = '',
    type = '',
    editMode = false,
}) => (
    <div className="flex justify-start flex-row flex-wrap">
        {tokenValues.map(([key, value]) => {
            const stringPath = [path, key].filter((n) => n).join('.');
            return (
                <React.Fragment key={stringPath}>
                    {typeof value === 'object' && !isTypographyToken(value) ? (
                        <div className="property-wrapper w-full">
                            <div className="flex items-center justify-between">
                                <Heading size="small">{key}</Heading>
                                {editMode && (
                                    <Tooltip label="Add a new token in group" variant="right">
                                        <button
                                            className="button button-ghost"
                                            type="button"
                                            onClick={() => {
                                                showNewForm([path, key].join('.'), schema);
                                            }}
                                        >
                                            <Icon name="add" />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>

                            {renderKeyValue({
                                tokenValues: Object.entries(value),
                                showNewForm,
                                showForm,
                                property,
                                schema,
                                path: stringPath,
                                type,
                                editMode,
                            })}
                        </div>
                    ) : (
                        <TokenButton
                            property={property}
                            type={type}
                            editMode={editMode}
                            name={key}
                            path={path}
                            token={value}
                            showForm={showForm}
                        />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

export default renderKeyValue;
