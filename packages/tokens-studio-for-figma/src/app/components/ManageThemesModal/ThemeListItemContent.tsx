import React, {
  useCallback, useContext,
} from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@stitches/react';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import { StyledDragButton } from '../StyledDragger/StyledDragButton';
import { DragGrabber } from '../StyledDragger/DragGrabber';
import { SingleThemeEntry } from './SingleThemeEntry';
import { ThemeObject } from '@/types';

type Props = React.PropsWithChildren<{
  item: ThemeObject
  isActive: boolean
  groupName: string
  onOpen: (theme?: ThemeObject) => void;
}>;

const StyledDragGrabber = styled(DragGrabber, {
  gridArea: 'handle',
});

export function ThemeListItemContent({
  item,
  isActive,
  groupName,
  onOpen,
}: Props) {
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);

  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  return (
    <StyledDragButton
      type="button"
      canReorder={!editProhibited}
      css={{
        padding: 0, width: '100%', display: 'inherit', cursor: 'inherit',
      }}
    >
      <StyledDragGrabber<ThemeObject>
        item={item}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <SingleThemeEntry
        key={item.id}
        theme={item}
        isActive={isActive}
        groupName={groupName}
        onOpen={onOpen}

      />
    </StyledDragButton>
  );
}
