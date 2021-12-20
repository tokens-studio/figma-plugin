import * as React from 'react';
import { useSelector } from 'react-redux';
import Icon from './Icon';
import { RootState } from '../store';

export default function CacheBuilderLoadingBar() {
  const { nodemanagerCache } = useSelector((state: RootState) => state.uiState);

  if (!nodemanagerCache.building) return null;

  return (
    <div className="fixed w-full z-20" data-cy="loadingBar">
      <div className="flex items-center space-x-2 bg-gray-300 p-2 rounded m-2">
        <div className="inline-flex rotate">
          <Icon name="loading" />
        </div>
        <div className="font-medium text-xxs">
          Building node cache (
          {nodemanagerCache.cachedCount}
          /
          {nodemanagerCache.totalCount}
          )
        </div>
      </div>
    </div>
  );
}
