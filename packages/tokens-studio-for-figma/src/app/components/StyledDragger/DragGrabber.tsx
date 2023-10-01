import React, { useCallback } from 'react';
import IconGrabber from '@/icons/grabber.svg';
import { StyledGrabber } from './StyledGrabber';
import { StyledBeforeFlex } from './StyledBeforeFlex';

export type Props<T> = {
  item: T;
  canReorder?: boolean;
  onDragStart?: (event: React.PointerEvent<HTMLDivElement>, item: T) => void;
};

export function DragGrabber<T>({
  item,
  canReorder = false,
  onDragStart,
}: Props<T>) {
  const handleGrabberPointerDown = useCallback<React.PointerEventHandler<HTMLDivElement>>((event) => {
    if (onDragStart) onDragStart(event, item);
  }, [item, onDragStart]);

  return (
    <StyledBeforeFlex>
      {canReorder ? (
        <StyledGrabber onPointerDown={handleGrabberPointerDown}>
          <IconGrabber />
        </StyledGrabber>
      ) : null}
    </StyledBeforeFlex>
  );
}
