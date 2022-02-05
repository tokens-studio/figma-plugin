import { MessageToPluginTypes } from '@/types/messages';
import { postToFigma } from '../../plugin/notifiers';

const createAnnotation = (tokens, direction = 'left') => {
  postToFigma({
    type: MessageToPluginTypes.CREATE_ANNOTATION,
    tokens,
    direction,
  });
  return {};
};

export default createAnnotation;
