import React from 'react';
import { useSelector } from 'react-redux';

import { allTokenSetsSelector } from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ExportTokenSet } from '@/types/ExportTokenSet';

export default function useExportSetsTab() {
  const allSets = useSelector(allTokenSetsSelector);
  const [selectedSets, setSelectedSets] = React.useState<ExportTokenSet[]>(allSets.map((set) => {
    const tokenSet = {
      set,
      status: TokenSetStatus.ENABLED,
    };
    return tokenSet;
  }));

  return {
    selectedSets,
    setSelectedSets,
  };
}
