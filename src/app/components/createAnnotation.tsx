import { SelectionValue } from '@/types';
import { MessageToPluginTypes } from '@/types/messages';
import { track } from '@/utils/analytics';
import { postToFigma } from '../../plugin/notifiers';

type Direction = 'left' | 'top' | 'bottom' | 'right';

const createAnnotation = (selectionValue: SelectionValue, direction: Direction = 'left') => {
  track('Created annotation', { direction });

  postToFigma({
    type: MessageToPluginTypes.CREATE_ANNOTATION,
    tokens: selectionValue,
    direction,
  });
};

export default createAnnotation;
