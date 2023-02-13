import React, {
  useCallback, useContext,
} from 'react';
import { useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import Box from '../Box';
import { StyledDragButton } from '../StyledDragger/StyledDragButton';
import { DragGrabber } from '../StyledDragger/DragGrabber';

type AvailableThemeItem = {
  value: string;
  label: string;
};

type ThemeListItemContentProps = React.PropsWithChildren<{
  item: AvailableThemeItem
  isActive: boolean
  onClick: (themeId: string) => void;
}>;

export function ThemeListItemContent({
  item,
  isActive,
  onClick,
}: ThemeListItemContentProps) {
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);

  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  const handleClick = useCallback(() => {
    onClick(item.value);
  }, [item, onClick]);

  return (
    <StyledDragButton
      type="button"
      isActive={isActive}
    >
      <DragGrabber<AvailableThemeItem>
        item={item}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <Box css={{ width: '$5', marginRight: '$2' }}>
        {
        isActive && <CheckIcon />
      }
      </Box>
      <Box
        css={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          userSelect: 'none',
        }}
        data-cy={`themeselector--themeoptions--${item.value}`}
        data-testid={`themeselector--themeoptions--${item.value}`}
        onClick={handleClick}
      >
        {item.label}
      </Box>
    </StyledDragButton>
  );
}
