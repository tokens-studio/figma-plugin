import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';

let resolveCallback;
function usePushDialog() {
    const {showPushDialog} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const pushDialog = (initialState): Promise<{commitMessage: string; customBranch: string}> => {
        if (initialState) {
            dispatch.uiState.setShowPushDialog('success');
        } else {
            dispatch.uiState.setShowPushDialog('initial');

            return new Promise((res, rej) => {
                resolveCallback = res;
            });
        }
    };

    const closeDialog = () => {
        dispatch.uiState.setShowPushDialog(false);
    };

    const onCancel = () => {
        closeDialog();
        resolveCallback(null);
    };

    const onConfirm = (commitMessage, customBranch) => {
        dispatch.uiState.setShowPushDialog('loading');
        resolveCallback({commitMessage, customBranch});
    };

    return {pushDialog, onConfirm, onCancel, showPushDialog};
}

export default usePushDialog;
