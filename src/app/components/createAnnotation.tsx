import { MessageToPluginTypes } from '@/types/messages';
import { track } from '@/utils/analytics';
import { postToFigma } from '../../plugin/notifiers';

const createAnnotation = (tokens, direction = 'left') => {
  track('Created annotation', { direction });

  postToFigma({
    type: MessageToPluginTypes.CREATE_ANNOTATION,
    tokens,
    direction,
  });
  return {};
};

export default createAnnotation;
