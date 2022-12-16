import React, { useCallback } from 'react';
import { LinkBreak2Icon } from '@radix-ui/react-icons';
import { IconArrowRight } from '@/icons';
import Box from '../Box';
import { Flex } from '../Flex';
import Text from '../Text';
import ResolvingLoader from '../ResolvingLoader';
import { StyledUnlinkButton } from './StyledUnlinkButton';
import StyledBrokenReferenceIndicator from '../StyledBrokenReferenceIndicator';

export type StyleInfo = {
  id: string
  name?: string
  failedToResolve?: boolean
};

type Props = {
  token: string
  styleInfo: StyleInfo
  icon?: React.ReactNode | null
  onDisconnectStyle: (token: string) => void
};

export const ThemeStyleManagementCategoryStyleEntry: React.FC<Props> = ({
  token,
  styleInfo,
  icon,
  onDisconnectStyle,
}) => {
  const handleDisconnectStyle = useCallback(() => {
    onDisconnectStyle(token);
  }, [token, onDisconnectStyle]);

  return (
    <Flex
      key={token}
      css={{
        gap: '$3',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      {icon && <Box>{icon}</Box>}
      <Flex
        css={{
          gap: '$3',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box css={{
          flexGrow: 1, display: 'flex', alignItems: 'center', gap: '$3',
        }}
        >
          <Text size="small">{token}</Text>
          <IconArrowRight width="16" />
          {(!styleInfo.name && !styleInfo.failedToResolve) && (
            <ResolvingLoader />
          )}
          {(!styleInfo.name && styleInfo.failedToResolve) && (
            <StyledBrokenReferenceIndicator />
          )}
          {styleInfo.name && (
            <Text bold size="small" title={styleInfo.name} css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{styleInfo.name}</Text>
          )}
        </Box>
        {(styleInfo.name && !styleInfo.failedToResolve) && (
          <StyledUnlinkButton data-testid="themestylemanagementcategorystyleentry-unlink" type="button" onClick={handleDisconnectStyle}>
            <LinkBreak2Icon />
          </StyledUnlinkButton>
        )}
      </Flex>
    </Flex>
  );
};
