import React from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@/stitches.config';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { track } from '@/utils/analytics';

export const StyledProBadge = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xxsmall',
  padding: '$2',
  borderRadius: '$medium',
  backgroundColor: '$proBg',
  lineHeight: 1,
  color: '$proFg',
  fontWeight: '$sansBold',
  textTransform: 'uppercase',
  border: '1px solid transparent',

  '&:hover, &:focus': {
    borderColor: '$proBorder',
  },
});

type Props = {
  readonly compact?: boolean;
  readonly campaign: string;
};

export default function ProBadge({ compact, campaign }: Props) {
  const isProUser = useIsProUser();
  const { t } = useTranslation(['licence']);

  const link = `https://tokens.studio/pro?ref=figma-plugin&utm_source=figma-plugin&utm_medium=pro-badge&utm_campaign=${campaign}`;

  const handleClick = React.useCallback(() => {
    track('Pro Badge Clicked', {
      campaign,
      source: 'pro-badge',
      isProUser,
    });
  }, [campaign, isProUser]);

  return (
    <StyledProBadge href={link} target="_blank" onClick={handleClick}>
      {isProUser || compact ? t('pro') : t('getPro')}
    </StyledProBadge>
  );
}
