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
  indentationDepth?: number
  isUnderExtendedGroup?: boolean // NEW: indicates if this theme belongs to an extended group
}>;

const StyledDragGrabber = styled(DragGrabber, {
  gridArea: 'handle',
});

export function ThemeListItemContent({
  item,
  isActive,
  groupName,
  onOpen,
  indentationDepth = 0,
  isUnderExtendedGroup = false,
}: Props) {
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);

  // Disable reordering for extended themes (they should follow parent theme order)
  const isExtendedTheme = !!item.$figmaParentThemeId;
  const canReorder = !editProhibited && !isExtendedTheme;

  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  return (
    <StyledDragButton
      type="button"
      canReorder={canReorder}
      css={{
        padding: 0,
        width: '100%',
        display: 'inherit',
        cursor: 'inherit',
        position: 'relative',
        // Progressive indentation based on depth level (each level adds $6 padding)
        ...(indentationDepth > 0 ? { paddingLeft: `calc($6 * ${indentationDepth})` } : {}),
        // Visual hierarchy line for extended groups
        ...(isUnderExtendedGroup ? {
          '&::before': {
            content: '',
            position: 'absolute',
            left: '12px',
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: '$borderMuted',
          },
          '&:last-of-type::before': {
            bottom: '50%',
            borderBottomLeftRadius: '$medium',
            borderBottom: '1px solid $borderMuted',
            borderLeft: '1px solid $borderMuted',
            width: '4px',
            backgroundColor: 'transparent',
          },
        } : {}),
      }}
    >
      <StyledDragGrabber<ThemeObject>
        item={item}
        canReorder={canReorder}
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
