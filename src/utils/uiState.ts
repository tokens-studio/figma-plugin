import { notifyUI, notifyUiState } from '@/plugin/notifiers';

export async function updateUiState({ showEmptyGroups }) {
  try {
    await figma.clientStorage.setAsync('uiState', JSON.stringify({ showEmptyGroups }));
  } catch (err) {
    notifyUI('There was an issue saving your credentials. Please try again.');
  }
}

export async function getUiState() {
  let uiState: any = {};
  try {
    const localUiState = await figma.clientStorage.getAsync('uiState');
    if (localUiState) {
      uiState = await JSON.parse(localUiState);
    }

    if (uiState?.showEmptyGroups != null) {
      notifyUiState(uiState.showEmptyGroups);
    }
  } catch (err) {
    notifyUI('There was an issue saving your credentials. Please try again.');
  }

  return uiState;
}
