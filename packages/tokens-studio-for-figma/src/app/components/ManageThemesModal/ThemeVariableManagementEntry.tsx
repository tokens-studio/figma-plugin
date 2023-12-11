import React, { useCallback } from 'react';
import { ArrowRightIcon, LinkBreak1Icon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { Box } from '@tokens-studio/ui';
import { Flex } from '../Flex';
import Text from '../Text';
import ResolvingLoader from '../ResolvingLoader';
import IconButton from '../IconButton';
import Stack from '../Stack';
import Checkbox from '../Checkbox';

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
        }}
      >
        <Box css={{
          flexGrow: 1, display: 'flex', alignItems: 'center', gap: '$3', overflow: 'hidden',
        }}
        >
          <Text size="small">{token}</Text>
          <ArrowRightIcon />
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
        <IconButton tooltip="Detach variable" icon={<LinkBreak2Icon />} variant="invisible" data-testid="ThemeVariableManagementEntry-unlink" onClick={handleDisconnectVariable} />
      </Flex>
    </Flex>
  );
};
