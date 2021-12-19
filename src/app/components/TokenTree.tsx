import * as React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import Icon from './Icon';
import TokenButton from './TokenButton';
import TokenGroupHeading from './TokenGroupHeading';
import Tooltip from './Tooltip';
import {isSingleToken, isTypographyToken} from './utils';

var TokenTree = function ({tokenValues, showNewForm, showForm, schema, path = null, type = '', resolvedTokens}) {
    const {editProhibited} = useSelector((state: RootState) => state.tokenState);

    return (
        <div className="flex justify-start flex-row flex-wrap">
            {Object.entries(tokenValues).map(([name, value]) => {
                const stringPath = [path, name].filter((n) => n).join('.');

                return (
                    <React.Fragment key={stringPath}>
                        {typeof value === 'object' && !isTypographyToken(value) && !isSingleToken(value) ? (
                            <div className="property-wrapper w-full" data-cy={`token-group-${stringPath}`}>
                                <div className="flex items-center justify-between group">
                                    <TokenGroupHeading label={name} path={stringPath} id="listing" />
                                    <Tooltip label="Add a new token" variant="right">
                                        <button
                                            disabled={editProhibited}
                                            data-cy="button-add-new-token-in-group"
                                            className="button button-ghost opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            type="button"
                                            onClick={() => {
                                                showNewForm({name: `${stringPath}.`});
                                            }}
                                        >
                                            <Icon name="add" />
                                        </button>
                                    </Tooltip>
                                </div>

                                <TokenTree
                                    tokenValues={value}
                                    showNewForm={showNewForm}
                                    showForm={showForm}
                                    schema={schema}
                                    path={stringPath}
                                    type={type}
                                    resolvedTokens={resolvedTokens}
                                />
                            </div>
                        ) : (
                            <TokenButton
                                type={type}
                                token={value}
                                showForm={showForm}
                                resolvedTokens={resolvedTokens}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default TokenTree;
