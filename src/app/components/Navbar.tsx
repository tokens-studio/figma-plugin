import * as React from 'react';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import {StorageProviderType} from '../../../types/api';

const TabButton = ({name, label, active, setActive, first = false}) => (
    <button
        data-cy={`navitem-${name}`}
        type="button"
        className={`px-2 py-4 text-xxs focus:outline-none focus:shadow-none font-medium cursor-pointer hover:text-black
        ${active === name ? 'text-black' : 'text-gray-500'}
        ${first ? 'pl-4' : ''}`}
        name="text"
        onClick={() => setActive(name)}
    >
        {label}
    </button>
);

const Navbar = ({active, setActive}) => {
    const {storageType, editProhibited, projectURL} = useTokenState();
    const {pullStyles} = useTokenDispatch();
    const {pullTokens} = useRemoteTokens();

    return (
        <div className="sticky top-0 navbar bg-white flex items-center justify-between z-1 border-b border-gray-200">
            <div>
                <TabButton first name="tokens" label="Tokens" active={active} setActive={setActive} />
                <TabButton name="json" label="JSON" active={active} setActive={setActive} />
                <TabButton name="inspector" label="Inspect" active={active} setActive={setActive} />
                <TabButton name="syncsettings" label="Sync" active={active} setActive={setActive} />
            </div>
            <div className="flex flex-row items-center">
                {storageType.provider !== StorageProviderType.LOCAL && (
                    <>
                        {projectURL && (
                            <Tooltip variant="right" label={`Go to ${storageType.provider}`}>
                                <a href={projectURL} target="_blank" rel="noreferrer" className="button button-ghost">
                                    <Icon name="library" />
                                </a>
                            </Tooltip>
                        )}
                        <Tooltip variant="right" label={`Pull from ${storageType.provider}`}>
                            <button onClick={pullTokens} type="button" className="button button-ghost">
                                <Icon name="refresh" />
                            </button>
                        </Tooltip>
                    </>
                )}
                <Tooltip variant="right" label="Import Styles">
                    <button
                        disabled={editProhibited}
                        className="button button-ghost"
                        type="button"
                        onClick={pullStyles}
                    >
                        <Icon name="import" />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

export default Navbar;
