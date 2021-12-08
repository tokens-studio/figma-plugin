import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';
import {ConfirmProps} from '../store/models/uiState';

let resolveCallback;
function useConfirm() {
    const {confirmState} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const confirm = ({
        text,
        description,
        confirmAction,
        choices,
    }: ConfirmProps): Promise<{result: boolean; data?: any}> => {
        dispatch.uiState.setShowConfirm({text, description, confirmAction, choices});

        return new Promise((res, rej) => {
            resolveCallback = res;
        });
    };

    const closeConfirm = () => {
        dispatch.uiState.setHideConfirm();
    };

    const onCancel = () => {
        closeConfirm();
        resolveCallback(false);
    };

    const onConfirm = (data) => {
        closeConfirm();
        resolveCallback({result: true, data});
    };

    return {confirm, onConfirm, onCancel, confirmState};
}

export default useConfirm;
