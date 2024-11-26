import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IconButton, Heading } from '@tokens-studio/ui';
import {
  IconCollapseArrow, IconExpandArrow, IconList, IconGrid, IconAdd,
} from '@/icons';
import { activeTokenSetReadOnlySelector, displayTypeSelector, editProhibitedSelector } from '@/selectors';
import ProBadge from './ProBadge';

import { Dispatch } from '../store';
import Tooltip from './Tooltip';
import Box from './Box';
import Stack from './Stack';
import { StyledTokenGroupHeadingButton } from './TokenGroup/StyledTokenGroupHeading';
import { useIsProUser } from '../hooks/useIsProUser';

type Props = {
  isCollapsed: boolean;
  isPro?: boolean;
  showNewForm: (options: { name?: string }) => void;
  label: string;
  tokenKey: string;
  showDisplayToggle: boolean;
  onCollapse: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function TokenListingHeading({
  isPro,
  isCollapsed,
  showNewForm,
  label,
  tokenKey,
  showDisplayToggle,
  onCollapse,
}: Props) {
  const dispatch = useDispatch<Dispatch>();
  const isProUser = useIsProUser();

  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSetReadOnly = useSelector(activeTokenSetReadOnlySelector);

  const displayType = useSelector(displayTypeSelector);
  const handleShowNewForm = React.useCallback(() => showNewForm({}), [showNewForm]);

  const handleToggleDisplayType = React.useCallback(() => {
    dispatch.uiState.setDisplayType(displayType === 'GRID' ? 'LIST' : 'GRID');
  }, [displayType, dispatch]);

  const { t } = useTranslation(['tokens']);

  return (
    <Stack direction="row" align="center" justify="between" gap={4} css={{ position: 'relative' }}>
      <StyledTokenGroupHeadingButton
        isCollapsed={isCollapsed}
        type="button"
        onClick={onCollapse}
        data-testid={`tokenlisting-${tokenKey}-collapse-button`}
      >
        <Tooltip label={`Alt + Click ${t('toggle')}`}>
          <Box css={{ padding: '$2', margin: '-$2' }}>{isCollapsed ? <IconCollapseArrow /> : <IconExpandArrow />}</Box>
        </Tooltip>
        <Heading size="small">{label}</Heading>
        {isPro ? <ProBadge campaign={`${tokenKey}-listing`} /> : null}
      </StyledTokenGroupHeadingButton>
      <Box
        css={{
          position: 'absolute',
          right: 0,
          display: 'flex',
          marginRight: '$2',
        }}
      >
        {showDisplayToggle && (
          <IconButton
            icon={displayType === 'GRID' ? <IconList /> : <IconGrid />}
            tooltip={displayType === 'GRID' ? t('showAsList') : t('showAsGrid')}
            onClick={handleToggleDisplayType}
            variant="invisible"
            size="small"
          />
        )}

        <IconButton
          data-testid="button-add-new-token"
          // TODO: Add proper logic to disable adding a token type depending on flags
          disabled={editProhibited || activeTokenSetReadOnly || (isPro && !isProUser)}
          icon={<IconAdd />}
          tooltip={t('addNew')}
          onClick={handleShowNewForm}
          variant="invisible"
          size="small"
        />
      </Box>
    </Stack>
  );
}
