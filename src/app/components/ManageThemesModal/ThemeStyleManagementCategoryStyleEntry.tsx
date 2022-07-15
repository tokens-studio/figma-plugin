import React, { useCallback } from 'react';
import { IconArrowRight, IconUnlink } from '@/icons';
import Box from '../Box';
import { Flex } from '../Flex';
import Text from '../Text';
import ResolvingLoader from '../ResolvingLoader';
import { StyledUnlinkButton } from './StyledUnlinkButton';

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
        }}
      >
        <Text size="small">{token}</Text>
        <IconArrowRight width="16" />
        {(!styleInfo.name && !styleInfo.failedToResolve) && (
          <ResolvingLoader />
        )}
        {(!styleInfo.name && styleInfo.failedToResolve) && (
          <StyledUnlinkButton type="button" onClick={handleDisconnectStyle}>
            <IconUnlink />
          </StyledUnlinkButton>
        )}
        {styleInfo.name && (
          <Text bold size="small">{styleInfo.name}</Text>
        )}
      </Flex>
    </Flex>
  );
};
