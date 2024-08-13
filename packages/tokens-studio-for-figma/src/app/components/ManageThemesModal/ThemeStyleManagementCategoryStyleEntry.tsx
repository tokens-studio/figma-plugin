import React, { useCallback } from 'react';
import { ArrowRightIcon, LinkBreak1Icon, LinkBreak2Icon } from '@radix-ui/react-icons';
import {
  Box, IconButton, Tooltip, Checkbox,
} from '@tokens-studio/ui';
import { Flex } from '../Flex';
import Text from '../Text';
import ResolvingLoader from '../ResolvingLoader';
import Stack from '../Stack';

export type StyleInfo = {
  id: string
  name?: string
  failedToResolve?: boolean
};

type Props = {
  token: string
  styleInfo: StyleInfo
  icon?: React.ReactNode | null
  isChecked: boolean
  onDisconnectStyle: (token: string) => void
  handleToggleSelectedStyle: (token: string) => void
};

export const ThemeStyleManagementCategoryStyleEntry: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  token,
  styleInfo,
  icon,
  isChecked,
  onDisconnectStyle,
  handleToggleSelectedStyle,
}) => {
  const handleDisconnectStyle = useCallback(() => {
    onDisconnectStyle(token);
  }, [token, onDisconnectStyle]);

  const onCheckedChanged = useCallback(() => {
    handleToggleSelectedStyle(token);
  }, [token, handleToggleSelectedStyle]);

  return (
    <Flex
      key={token}
      css={{
        gap: '$3',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <Checkbox
        checked={isChecked}
        id={token}
        onCheckedChange={onCheckedChanged}
      />

      {icon && <Box>{icon}</Box>}
      <Flex
        css={{
          gap: '$3',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
        }}
      >
        <Tooltip
          side="bottom"
          label={(
            <Stack direction="column" align="start" gap={1} css={{ wordBreak: 'break-word' }}>
              <Text css={{ color: '$tooltipFg' }}>
                {token}
              </Text>
              <Text css={{ color: '$tooltipFgMuted' }}>
                {styleInfo.name}
              </Text>
            </Stack>
          )}
        >
          <Box css={{
            flexGrow: 1, display: 'flex', alignItems: 'center', gap: '$3', overflow: 'hidden',
          }}
          >
            <Text css={{ overflow: 'hidden', textOverflow: 'ellipsis' }} size="small">{token}</Text>
            <Box css={{ flexShrink: 0 }}>
              <ArrowRightIcon />
            </Box>
            {(!styleInfo.name && !styleInfo.failedToResolve) && (
            <ResolvingLoader />
            )}
            {(!styleInfo.name && styleInfo.failedToResolve) && (
            <Stack direction="row" gap={1} css={{ color: '$dangerFg' }}>
              <LinkBreak1Icon />
              Reference not found
            </Stack>
            )}
            {styleInfo.name && (
            <Text bold size="small" title={styleInfo.name} css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{styleInfo.name}</Text>
            )}
          </Box>
        </Tooltip>
        <IconButton size="small" variant="invisible" tooltip="Detach style" icon={<LinkBreak2Icon />} data-testid="themestylemanagementcategorystyleentry-unlink" onClick={handleDisconnectStyle} />
      </Flex>
    </Flex>
  );
};
