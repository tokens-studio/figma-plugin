import {postToFigma} from '@/plugin/notifiers';
import {getMergedTokens} from '@/plugin/tokenHelpers';
import {useSelector} from 'react-redux';
import {MessageToPluginTypes} from '@types/messages';
import {RootState} from '../store';
import {SelectionValue} from './models/tokenState';

export default function useTokens() {
    const {tokens, usedTokenSet} = useSelector((state: RootState) => state.tokenState);

    // This should probably also not be in state
    function setNodeData(data: SelectionValue) {
        postToFigma({
            type: MessageToPluginTypes.SET_NODE_DATA,
            values: data,
            tokens: getMergedTokens(tokens, usedTokenSet, true),
        });
    }

    return {setNodeData};
}
