import * as React from 'react';
import {track} from '@/utils/analytics';
import {useTokenState} from '../store/TokenContext';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import {StorageProviderType} from '../../../types/api';

const TabButton = ({name, label, active, setActive, first = false}) => {
    const onClick = () => {
        track('Switched tab', {from: active, to: name});
        setActive(name);
    };
    return (
        <button
            data-cy={`navitem-${name}`}
            type="button"
            className={`px-2 py-4 text-xxs focus:outline-none focus:shadow-none font-medium cursor-pointer hover:text-black
        ${active === name ? 'text-black' : 'text-gray-500'}
        ${first ? 'pl-4' : ''}`}
            name="text"
            onClick={() => onClick()}
        >
            {label}
        </button>
    );
};

const transformProviderName = (provider) => {
    switch (provider) {
        case StorageProviderType.JSONBIN:
            return 'JSONBin.io';
        case StorageProviderType.ARCADE:
            return 'Arcade';
        default:
            return provider;
    }
};

const Navbar = ({active, setActive}) => {
    const {storageType, projectURL, syncEnabled} = useTokenState();
    const {pullTokens} = useRemoteTokens();

    return (
        <div className="sticky top-0 navbar bg-white flex items-center justify-between z-1 border-b border-gray-200">
            <div>
                <TabButton first name="tokens" label="Tokens" active={active} setActive={setActive} />
                <TabButton name="inspector" label="Inspect" active={active} setActive={setActive} />
                {syncEnabled && <TabButton name="syncsettings" label="Sync" active={active} setActive={setActive} />}
            </div>
            <div className="flex flex-row items-center">
                {storageType.provider !== StorageProviderType.LOCAL && (
                    <>
                        {projectURL && (
                            <Tooltip variant="right" label={`Go to ${transformProviderName(storageType.provider)}`}>
                                <a href={projectURL} target="_blank" rel="noreferrer" className="button button-ghost">
                                    <Icon name="library" />
                                </a>
                            </Tooltip>
                        )}
                        <Tooltip variant="right" label={`Pull from ${transformProviderName(storageType.provider)}`}>
                            <button onClick={pullTokens} type="button" className="button button-ghost">
                                <Icon name="refresh" />
                            </button>
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;
