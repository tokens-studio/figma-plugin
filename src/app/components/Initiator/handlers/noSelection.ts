import type { Dispatch } from '@/app/store';

export function noSelection(dispatch: Dispatch) {
  dispatch.uiState.setDisabled(true);
  dispatch.uiState.setSelectedLayers(0);
  dispatch.uiState.resetSelectionValues();
  dispatch.uiState.setMainNodeSelectionValues({});
}
