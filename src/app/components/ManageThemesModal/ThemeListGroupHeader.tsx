import React, {
  useCallback, useContext,
} from 'react';
import { useSelector } from 'react-redux';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import { StyledDragButton } from '../StyledDragger/StyledDragButton';
import { DragGrabber } from '../StyledDragger/DragGrabber';
import Text from '../Text';

type Props = React.PropsWithChildren<{
  item: string
  groupName: string
}>;

export function ThemeListGroupHeader({
  item,
  groupName,
}: Props) {
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);

  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  return (
    <StyledDragButton
      type="button"
      style={{ cursor: 'inherit' }}
    >
      <DragGrabber<string>
        item={item}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <Text css={{ color: '$textSubtle', padding: '$2 $3' }}>{groupName}</Text>
    </StyledDragButton>
  );
}
