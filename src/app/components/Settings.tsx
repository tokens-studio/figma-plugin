/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Checkbox from './Checkbox';
import Heading from './Heading';
import {RootState, Dispatch} from '../store';

const SyncSettings = () => {
    const {ignoreFirstPartForStyles, useAbsoluteAliases} = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch<Dispatch>();

    const handleIgnoreChange = (bool) => {
        dispatch.settings.setIgnoreFirstPartForStyles(bool);
    };
    const handleAbsoluteAliases = useCallback(
        (bool) => {
            dispatch.settings.setUseAbsoluteAliases(bool);
        },
        [dispatch]
    );

    return (
        <div className="flex flex-col flex-grow">
            <div className="p-4 space-y-4 border-b">
                <div className="space-y-4">
                    <Heading>Styles</Heading>
                    <div className="space-y-2">
                        <Checkbox
                            name="ignoreFirstPartForStyles"
                            checked={ignoreFirstPartForStyles}
                            onChange={handleIgnoreChange}
                            label="Ignore first part of token name for styles"
                        />
                        <div className="text-xs">
                            If active a token named <code className="p-1 -m-1 font-bold">colors.primary.500</code> will
                            become a color style of name <code className="p-1 -m-1 font-bold">primary/500</code>. Since
                            Version 53 you no longer need to prepend type to token names.
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Checkbox
                            name="useAbsoluteAliases"
                            checked={useAbsoluteAliases}
                            onChange={handleAbsoluteAliases}
                            label="Use absolute aliases"
                        />
                        <div className="text-xs">
                            This makes it possible to specify which token set an alias refers to. The default behaviour
                            is ambiguous; <code className="p-1 -m-1 font-bold">&#123;colors.blue.500&#125;</code> could
                            refer to the current theme or the global one depending on context. With this option all
                            aliases need to include the theme to avoid this e.g.{' '}
                            <code className="p-1 -m-1 font-bold">&#123;global.colors.blue.500&#125;</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SyncSettings;
