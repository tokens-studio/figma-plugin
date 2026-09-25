import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function setExportExtendedCollections() {
    return (payload: boolean, rootState: any) => {
        AsyncMessageChannel.ReactInstance.message({
            type: AsyncMessageTypes.SET_UI,
            ...rootState.settings,
        });
    };
}
