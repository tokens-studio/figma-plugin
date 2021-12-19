import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { track } from '@/utils/analytics';
import convertTokensToObject from '@/utils/convertTokensToObject';
import Icon from './Icon';
import Tooltip from './Tooltip';
import useRemoteTokens from '../store/remoteTokens';
import { StorageProviderType } from '../../types/api';
import { RootState, Dispatch } from '../store';

function TabButton({ name, label, first = false }) {
  const { activeTab } = useSelector((state: RootState) => state.uiState);
  const dispatch = useDispatch<Dispatch>();

  const onClick = () => {
    track('Switched tab', { from: activeTab, to: name });
    dispatch.uiState.setActiveTab(name);
  };

  return (
    <button
      data-cy={`navitem-${name}`}
      type="button"
      className={`px-2 py-4 text-xxs focus:outline-none focus:shadow-none font-medium cursor-pointer focus:text-black hover:text-black
        ${activeTab === name ? 'text-black' : 'text-gray-500'}
        ${first ? 'pl-4' : ''}`}
      name="text"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

const transformProviderName = (provider) => {
  switch (provider) {
    case StorageProviderType.JSONBIN:
      return 'JSONBin.io';
    case StorageProviderType.GITHUB:
      return 'GitHub';
    case StorageProviderType.URL:
      return 'URL';
    default:
      return provider;
  }
};

function Navbar() {
  const { projectURL, storageType } = useSelector((state: RootState) => state.uiState);
  const { lastSyncedState, tokens, editProhibited } = useSelector((state: RootState) => state.tokenState);
  const { toggleFilterVisibility } = useDispatch<Dispatch>().uiState;
  const { pullTokens, pushTokens } = useRemoteTokens();

  const checkForChanges = () => {
    if (lastSyncedState !== JSON.stringify(convertTokensToObject(tokens), null, 2)) {
      return true;
    }
  };

  return (
    <div className="sticky top-0 navbar bg-white flex items-center justify-between z-1 border-b border-gray-200">
      <div>
        <TabButton first name="tokens" label="Tokens" />
        <TabButton name="json" label="JSON" />
        <TabButton name="inspector" label="Inspect" />
        <TabButton name="syncsettings" label="Sync" />
        <TabButton name="settings" label="Settings" />
      </div>
      <div className="flex flex-row items-center">
        <Tooltip variant="right" label="Filter tokens">
          <button onClick={toggleFilterVisibility} type="button" className="button button-ghost">
            <MagnifyingGlassIcon />
          </button>
        </Tooltip>
        {storageType.provider !== StorageProviderType.LOCAL && (
        <>
          {storageType.provider === StorageProviderType.JSONBIN && (
          <Tooltip variant="right" label={`Go to ${transformProviderName(storageType.provider)}`}>
            <a
              href={projectURL}
              target="_blank"
              rel="noreferrer"
              className="block button button-ghost"
            >
              <Icon name="library" />
            </a>
          </Tooltip>
          )}
          {storageType.provider === StorageProviderType.GITHUB && (
          <Tooltip variant="right" label={`Push to ${transformProviderName(storageType.provider)}`}>
            <button
              onClick={() => pushTokens()}
              type="button"
              className="button button-ghost relative"
              disabled={editProhibited}
            >
              {checkForChanges() && (
              <div className="rounded-full w-2 h-2 bg-primary-500 absolute right-0 top-0" />
              )}

              <Icon name="library" />
            </button>
          </Tooltip>
          )}

          <Tooltip variant="right" label={`Pull from ${transformProviderName(storageType.provider)}`}>
            <button onClick={() => pullTokens()} type="button" className="button button-ghost">
              <Icon name="refresh" />
            </button>
          </Tooltip>
        </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
