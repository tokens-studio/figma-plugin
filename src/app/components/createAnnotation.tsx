import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { SelectionValue } from '@/types';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { track } from '@/utils/analytics';

const createAnnotation = (tokens: SelectionValue, direction = 'left') => {
  track('Created annotation', { direction });

  AsyncMessageChannel.message({
    type: AsyncMessageTypes.CREATE_ANNOTATION,
    tokens,
    direction,
  });
  return {};
};

export default createAnnotation;
