import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';

let resolveCallback;
function usePushDialog() {
    const {showPushDialog} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const pushDialog = (): Promise<boolean> => {
        dispatch.uiState.setShowPushDialog(true);

        return new Promise((res, rej) => {
            resolveCallback = res;
        });
    };

    const closeDialog = () => {
        dispatch.uiState.setShowPushDialog(false);
    };

    const onCancel = () => {
        closeDialog();
        resolveCallback(false);
    };

    const onConfirm = (message) => {
        closeDialog();
        resolveCallback(message);
    };

    return {pushDialog, onConfirm, onCancel, showPushDialog};
}

export default usePushDialog;
