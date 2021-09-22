import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';

let resolveCallback;
function useConfirm() {
    const {confirmState} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const confirm = ({text, description}): Promise<boolean> => {
        dispatch.uiState.setShowConfirm({text, description});

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

    const onConfirm = () => {
        closeConfirm();
        resolveCallback(true);
    };

    return {confirm, onConfirm, onCancel, confirmState};
}

export default useConfirm;
