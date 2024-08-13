import React, { useCallback } from 'react';
import { ArrowRightIcon, LinkBreak1Icon, LinkBreak2Icon } from '@radix-ui/react-icons';
import {
  Box, IconButton, Tooltip, Checkbox,
} from '@tokens-studio/ui';
import { Flex } from '../Flex';
import Text from '../Text';
import ResolvingLoader from '../ResolvingLoader';
import Stack from '../Stack';

export type VariableInfo = {
  id: string
  name?: string
  isResolved?: boolean
};

type Props = {
  token: string
  variableInfo: VariableInfo
  isChecked: boolean
  onDisconnectVariable: (token: string) => void
  handleToggleSelectedVariable: (token: string) => void
};

export const ThemeVariableManagementEntry: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  token,
  variableInfo,
  isChecked,
  onDisconnectVariable,
  handleToggleSelectedVariable,
}) => {
  const handleDisconnectVariable = useCallback(() => {
    onDisconnectVariable(token);
  }, [token, onDisconnectVariable]);

  const onCheckedChanged = useCallback(() => {
    handleToggleSelectedVariable(token);
  }, [token, handleToggleSelectedVariable]);

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
                {variableInfo.name}
              </Text>
            </Stack>
          )}
        >
          <Box css={{
            flexGrow: 0, display: 'flex', alignItems: 'center', gap: '$3', overflow: 'hidden',
          }}
          >
            <Text css={{ overflow: 'hidden', textOverflow: 'ellipsis' }} size="small">{token}</Text>
            <Box css={{ flexShrink: 0 }}>
              <ArrowRightIcon />
            </Box>
            {(!variableInfo.name && !variableInfo.isResolved) && (
            <ResolvingLoader />
            )}
            {(!variableInfo.name && variableInfo.isResolved) && (
            <Stack direction="row" gap={1} css={{ color: '$dangerFg' }}>
              <LinkBreak1Icon />
              Reference not found
            </Stack>
            )}
            {variableInfo.name && (
            <Text bold size="small" title={variableInfo.name} css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{variableInfo.name}</Text>
            )}
          </Box>
        </Tooltip>
        <IconButton tooltip="Detach variable" icon={<LinkBreak2Icon />} variant="invisible" data-testid="ThemeVariableManagementEntry-unlink" onClick={handleDisconnectVariable} />
      </Flex>
    </Flex>
  );
};
