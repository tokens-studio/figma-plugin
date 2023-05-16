import React, { useCallback } from 'react';
import { LinkBreak1Icon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { IconArrowRight } from '@/icons';
import Box from '../Box';
import { Flex } from '../Flex';
import Text from '../Text';
import ResolvingLoader from '../ResolvingLoader';
import IconButton from '../IconButton';
import Stack from '../Stack';
import Checkbox from '../Checkbox';

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

export const ThemeStyleManagementCategoryStyleEntry: React.FC<Props> = ({
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
        }}
      >
        <Box css={{
          flexGrow: 1, display: 'flex', alignItems: 'center', gap: '$3', overflow: 'hidden',
        }}
        >
          <Text size="small">{token}</Text>
          <IconArrowRight width="16" />
          {(!styleInfo.name && !styleInfo.failedToResolve) && (
            <ResolvingLoader />
          )}
          {(!styleInfo.name && styleInfo.failedToResolve) && (
            <Stack direction="row" gap={1} css={{ color: '$fgDanger' }}>
              <LinkBreak1Icon />
              Reference not found
            </Stack>
          )}
          {styleInfo.name && (
            <Text bold size="small" title={styleInfo.name} css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{styleInfo.name}</Text>
          )}
        </Box>
        <IconButton tooltip="Detach style" icon={<LinkBreak2Icon />} dataCy="themestylemanagementcategorystyleentry-unlink" onClick={handleDisconnectStyle} />
      </Flex>
    </Flex>
  );
};
