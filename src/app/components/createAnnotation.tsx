import {notifyToUI, postToFigma} from '../../plugin/notifiers';
import {MessageToPluginTypes} from 'Types/messages';

const createAnnotation = (tokens, direction = 'left') => {
    postToFigma({
        type: MessageToPluginTypes.CREATE_ANNOTATION,
        tokens,
        direction,
    });
    return {};
};

export default createAnnotation;
