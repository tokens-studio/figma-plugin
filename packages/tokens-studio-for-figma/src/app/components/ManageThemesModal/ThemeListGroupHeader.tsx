import React, {
  useCallback, useContext, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, DropdownMenu } from '@tokens-studio/ui';
import { Xmark, Check } from 'iconoir-react';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import { StyledDragButton } from '../StyledDragger/StyledDragButton';
import { DragGrabber } from '../StyledDragger/DragGrabber';
import Text from '../Text';
import Box from '../Box';
import Input from '../Input';
import IconPencil from '@/icons/pencil.svg';
import { Dispatch } from '@/app/store';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

type Props = React.PropsWithChildren<{
  groupName: string
  label: string
  onExtendThemeGroup: (groupName: string) => void
  indentationDepth?: number
  isExtendedGroup?: boolean
}>;

export function ThemeListGroupHeader({
  groupName,
  label,
  onExtendThemeGroup,
  indentationDepth = 0,
  isExtendedGroup = false,
}: Props) {
  const dispatch = useDispatch<Dispatch>();
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);
  const [currentGroupName, setCurrentGroupName] = useState<string>(groupName === INTERNAL_THEMES_NO_GROUP ? '' : groupName);
  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);
  const [isGroupNameEditing, setIsGroupNameEditing] = useState<boolean>(false);

  const handleEditButtonClick = useCallback(() => {
    setIsGroupNameEditing(true);
  }, [setIsGroupNameEditing]);
  const handleCancel = useCallback(() => {
    setCurrentGroupName(groupName);
    setIsGroupNameEditing(false);
  }, [setIsGroupNameEditing]);

  const handleSubmit = React.useCallback(() => {
    dispatch.tokenState.updateThemeGroupName(groupName, currentGroupName);
    setIsGroupNameEditing(false);
  }, [currentGroupName, groupName]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      handleCancel();
    }
  }, [currentGroupName, groupName, dispatch.tokenState]);

  const handleGroupNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGroupName(event.target.value);
  }, []);

  const handleExtendGroup = useCallback(() => {
    onExtendThemeGroup(groupName);
  }, [groupName, onExtendThemeGroup]);

  return (
    <StyledDragButton
      type="button"
      canReorder={!editProhibited}
      css={{
        marginBottom: '$2',
        backgroundColor: '$bgDefault',
        display: 'flex',
        cursor: 'inherit',
        '&:not(:first-of-type)': { marginTop: '$4' },
        // Progressive indentation based on depth level (each level adds $6 padding)
        ...(indentationDepth > 0 ? { paddingLeft: `calc($6 * ${indentationDepth})` } : {}),
      }}
    >
      <DragGrabber
        item={groupName}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <Box css={{
        display: 'flex',
        alignItems: 'center',
        gap: '$2',
        '& > div > button ': {
          display: 'none',
        },
        '&:hover > div > button ': {
          display: 'block',
        },
      }}
      >
        {!isGroupNameEditing ? (
          <>
            <Text css={{
              color: '$fgMuted', height: '$controlSmall', display: 'flex', alignItems: 'center',
            }}
            >
              {label}
            </Text>
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <IconButton
                  icon={<Box css={{ transform: 'scale(0.75)' }}><DotsVerticalIcon /></Box>}
                  size="small"
                  variant="invisible"
                  tooltip="More options"
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content side="bottom">
                  <DropdownMenu.Item onSelect={handleEditButtonClick}>
                    <span>Rename Theme Group</span>
                  </DropdownMenu.Item>
                  {groupName !== INTERNAL_THEMES_NO_GROUP && (
                    <DropdownMenu.Item
                      onSelect={isExtendedGroup ? undefined : handleExtendGroup}
                      disabled={isExtendedGroup}
                    >
                      <Box css={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '$2',
                        ...(isExtendedGroup ? { color: '$fgDisabled', cursor: 'not-allowed' } : {})
                      }}>
                        <span>Extend Theme Group</span>
                      </Box>
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Input
              type="text"
              name={`groupName-${groupName}`}
              value={currentGroupName}
              onChange={handleGroupNameChange}
              onKeyDown={handleKeyDown}
              autofocus
              full
            />
            <IconButton
              onClick={handleCancel}
              icon={<Xmark />}
              color="$dangerBorder"
              size="small"
              tooltip="Cancel"
            />
            <IconButton
              onClick={handleSubmit}
              icon={<Check />}
              size="small"
              variant="primary"
              tooltip="Confirm"
            />
          </>
        )}
      </Box>
    </StyledDragButton>
  );
}
