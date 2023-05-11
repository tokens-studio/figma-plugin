import React, {
  useCallback, useContext, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import { StyledDragButton } from '../StyledDragger/StyledDragButton';
import { DragGrabber } from '../StyledDragger/DragGrabber';
import Text from '../Text';
import Box from '../Box';
import Input from '../Input';
import IconPencil from '@/icons/pencil.svg';
import IconButton from '../IconButton';
import { Dispatch } from '@/app/store';

type Props = React.PropsWithChildren<{
  groupName: string
  label: string
  editing: boolean
  setEditing: (value: boolean) => void
}>;

export function ThemeListGroupHeader({
  groupName,
  label,
  editing,
  setEditing,
}: Props) {
  const dispatch = useDispatch<Dispatch>();
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);
  const [hovered, setHovered] = useState(false);
  const [currentGroupName, setCurrentGroupName] = useState(label);
  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  const handleEditButtonClick = useCallback(() => {
    setEditing(true);
  }, []);

  const onMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      dispatch.tokenState.updateThemeGroupName(groupName, currentGroupName);
      setEditing(false);
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  }, [currentGroupName, groupName, dispatch.tokenState, setEditing]);

  const handleGroupNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGroupName(event.target.value);
  }, []);

  return (
    <StyledDragButton
      type="button"
      style={{ cursor: 'inherit' }}
      css={{ marginTop: '$4' }}
    >
      <DragGrabber<string>
        item={groupName}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <Box css={{ display: 'flex', alignItems: 'center' }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {!editing ? (
          <>
            <Text css={{ color: '$textMuted', padding: '$2' }}>{label}</Text>
            {
            hovered && (
              <IconButton
                onClick={handleEditButtonClick}
                icon={<IconPencil />}
              />
            )
          }
          </>
        ) : (
          <Input
            type="text"
            name={`groupName-${groupName}`}
            value={currentGroupName}
            onChange={handleGroupNameChange}
            onKeyDown={handleKeyDown}
            autofocus
          />
        )}
      </Box>
    </StyledDragButton>
  );
}
