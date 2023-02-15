import React, {
  useCallback, useContext,
} from 'react';
import { useSelector } from 'react-redux';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import { StyledDragButton } from '../StyledDragger/StyledDragButton';
import { DragGrabber } from '../StyledDragger/DragGrabber';
import { SingleThemeEntry } from '../ManageThemesModal/SingleThemeEntry';
import { ThemeObject } from '@/types';

type Props = React.PropsWithChildren<{
  item: ThemeObject
  isActive: boolean
  onOpen: (theme?: ThemeObject) => void;
}>;

export function ThemeListItemContent({
  item,
  isActive,
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
      isActive={isActive}
    >
      <DragGrabber<ThemeObject>
        item={item}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <SingleThemeEntry
        key={item.id}
        theme={item}
        isActive={isActive}
        onOpen={onOpen}
      />
    </StyledDragButton>
  );
}
