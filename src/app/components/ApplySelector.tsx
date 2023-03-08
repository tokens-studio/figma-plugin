import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { DotFilledIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
} from './DropdownMenu';
import { Dispatch } from '../store';
import IconChevronDown from '@/icons/chevrondown.svg';
import { settingsStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { UpdateMode } from '@/constants/UpdateMode';
import Stack from './Stack';
import Button from './Button';
import useTokens from '../store/useTokens';
import Box from './Box';

export default function ApplySelector() {
  const { updateMode } = useSelector(settingsStateSelector, isEqual);

  const { handleUpdate } = useTokens();

  const { setUpdateMode } = useDispatch<Dispatch>().settings;

  const handleApplySelection = React.useCallback(() => {
    setUpdateMode(UpdateMode.SELECTION);
  }, [setUpdateMode]);

  const handleApplyPage = React.useCallback(() => {
    setUpdateMode(UpdateMode.PAGE);
  }, [setUpdateMode]);

  const handleApplyDocument = React.useCallback(() => {
    setUpdateMode(UpdateMode.DOCUMENT);
  }, [setUpdateMode]);

  return (
    <Stack direction="row">
      <Button
        id="update-button"
        variant="primary"
        css={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        onClick={handleUpdate}
      >
        Apply to
        {' '}
        {updateMode}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          css={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            backgroundColor: '$interaction',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            borderLeft: '1px solid $interactionSubtle',
            color: '$onInteraction',
            '&:hover, &:focus-visible': { backgroundColor: '$interactionSubtle' },
          }}
          data-testid="apply-selector"
        >
          <IconChevronDown />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top">
          <DropdownMenuRadioGroup value={updateMode}>
            <DropdownMenuRadioItem
              data-testid="apply-to-selection"
              value={UpdateMode.SELECTION}
              onSelect={handleApplySelection}
            >
              <DropdownMenuItemIndicator>
                <DotFilledIcon />
              </DropdownMenuItemIndicator>
              Apply to selection
              <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
                Applies current tokens to current selection (fast!)
              </Box>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem data-testid="apply-to-page" value={UpdateMode.PAGE} onSelect={handleApplyPage}>
              <DropdownMenuItemIndicator>
                <DotFilledIcon />
              </DropdownMenuItemIndicator>
              Apply to page
              <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
                Applies current tokens to the current page
              </Box>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              data-testid="apply-to-document"
              value={UpdateMode.DOCUMENT}
              onSelect={handleApplyDocument}
            >
              <DropdownMenuItemIndicator>
                <DotFilledIcon />
              </DropdownMenuItemIndicator>
              Apply to document
              <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
                Applies current tokens to the whole document (slow!)
              </Box>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Stack>
  );
}
