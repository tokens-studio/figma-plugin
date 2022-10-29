import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { Direction } from '@/constants/Direction';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { track } from '@/utils/analytics';
import type { SelectionValue } from '@/types';

const createAnnotation = (selectionValue: SelectionValue, direction: Direction = Direction.LEFT) => {
  track('Created annotation', { direction });

  AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.CREATE_ANNOTATION,
    tokens: selectionValue,
    direction,
  });
};

export default createAnnotation;
