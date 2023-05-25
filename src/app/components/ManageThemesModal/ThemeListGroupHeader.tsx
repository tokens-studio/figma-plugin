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
  setIsGroupEditing: (value: boolean) => void
}>;

export function ThemeListGroupHeader({
  groupName,
  label,
  setIsGroupEditing,
}: Props) {
  const dispatch = useDispatch<Dispatch>();
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);
  const [currentGroupName, setCurrentGroupName] = useState(label);
  const [isEditing, setIsEditing] = useState(false);
  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  const handleEditButtonClick = useCallback(() => {
    setIsEditing(true);
    setIsGroupEditing(true);
  }, [setIsEditing, setIsGroupEditing]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      dispatch.tokenState.updateThemeGroupName(groupName, currentGroupName);
      setIsEditing(false);
      setIsGroupEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setIsGroupEditing(false);
    }
  }, [currentGroupName, groupName, dispatch.tokenState, setIsEditing, setIsGroupEditing]);

  const handleGroupNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGroupName(event.target.value);
  }, []);

  return (
    <StyledDragButton
      type="button"
      style={{ cursor: 'inherit' }}
      css={{ '&:not(:first-of-type)': { marginTop: '$4' } }}
    >
      <DragGrabber<string>
        item={groupName}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <Box css={{
        display: 'flex',
        alignItems: 'center',
        '& > div > button ': {
          display: 'none',
        },
        '&:hover > div > button ': {
          display: 'block',
        },
      }}
      >
        {!isEditing ? (
          <>
            <Text css={{
              color: '$textMuted', height: '28px', display: 'flex', alignItems: 'center',
            }}
            >
              {label}
            </Text>
            <IconButton
              onClick={handleEditButtonClick}
              icon={<IconPencil />}
            />
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
