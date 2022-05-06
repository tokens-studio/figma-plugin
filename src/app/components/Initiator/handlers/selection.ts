import type { Dispatch } from '@/app/store';
import type { SelectionFromPluginMessage } from '@/types/messages';

export function selection(dispatch: Dispatch, message: SelectionFromPluginMessage) {
  const { selectionValues, mainNodeSelectionValues, selectedNodes } = message;
  dispatch.uiState.setSelectedLayers(selectedNodes);
  dispatch.uiState.setDisabled(false);
  if (mainNodeSelectionValues.length > 1) {
    dispatch.uiState.setMainNodeSelectionValues({});
  } else if (mainNodeSelectionValues.length > 0) {
    // When only one node is selected, we can set the state
    dispatch.uiState.setMainNodeSelectionValues(mainNodeSelectionValues[0]);
  } else {
    // When only one is selected and it doesn't contain any tokens, reset.
    dispatch.uiState.setMainNodeSelectionValues({});
  }

  // Selection values are all tokens across all layers, used in Multi Inspector.
  if (selectionValues) {
    dispatch.uiState.setSelectionValues(selectionValues);
  } else {
    dispatch.uiState.resetSelectionValues();
  }
}
