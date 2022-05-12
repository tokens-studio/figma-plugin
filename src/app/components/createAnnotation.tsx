import { Direction } from '@/constants/Direction';
import { SelectionValue } from '@/types';
import { MessageToPluginTypes } from '@/types/messages';
import { track } from '@/utils/analytics';
import { postToFigma } from '../../plugin/notifiers';

const createAnnotation = (selectionValue: SelectionValue, direction: Direction = Direction.LEFT) => {
  track('Created annotation', { direction });

  postToFigma({
    type: MessageToPluginTypes.CREATE_ANNOTATION,
    tokens: selectionValue,
    direction,
  });
};

export default createAnnotation;
