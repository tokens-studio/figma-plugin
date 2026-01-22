import React, { useCallback, useMemo } from 'react';
import { LinkBreak2Icon } from '@radix-ui/react-icons';
import {
  Box, IconButton, Heading, Stack,
} from '@tokens-studio/ui';
import { useDispatch, useSelector } from 'react-redux';
import { Flex } from './Flex';
import Text from './Text';
import { Dispatch } from '../store';
import { themesListSelector } from '@/selectors/themesListSelector';
import { findThemeReferencesForToken, TokenVariableReference } from '@/utils/findThemeReferencesForToken';

type Props = {
  tokenName: string;
};

const ReferencedVariableEntry: React.FC<{
  reference: TokenVariableReference;
  onDetach: (themeId: string, tokenName: string) => void;
  tokenName: string;
}> = ({ reference, onDetach, tokenName }) => {
  const handleDetach = useCallback(() => {
    onDetach(reference.themeId, tokenName);
  }, [reference.themeId, tokenName, onDetach]);

  return (
    <Flex
      css={{
        gap: '$3',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '$2',
        backgroundColor: '$bgSubtle',
        borderRadius: '$small',
        border: '1px solid $borderMuted',
      }}
    >
      <Flex css={{
        gap: '$3', alignItems: 'center', flex: 1, minWidth: 0,
      }}
      >
        <Box css={{ flex: 1, minWidth: 0 }}>
          <Text size="small" css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {reference.themeName}
          </Text>
          <Text size="xsmall" muted css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Variable ID:
            {' '}
            {reference.variableId}
          </Text>
        </Box>
      </Flex>
      <IconButton
        tooltip="Detach variable from theme"
        icon={<LinkBreak2Icon />}
        variant="invisible"
        size="small"
        onClick={handleDetach}
      />
    </Flex>
  );
};

export const ReferencedVariableSection: React.FC<Props> = ({ tokenName }) => {
  const dispatch = useDispatch<Dispatch>();
  const themes = useSelector(themesListSelector);

  const references = useMemo(
    () => findThemeReferencesForToken(tokenName, themes),
    [tokenName, themes],
  );

  const handleDetachFromTheme = useCallback((themeId: string, token: string) => {
    dispatch.tokenState.disconnectVariableFromTheme({
      id: themeId,
      key: token,
    });
  }, [dispatch]);

  if (references.length === 0) {
    return null;
  }

  return (
    <Box>
      <Heading size="small">Referenced variables</Heading>
      <Text muted size="small" css={{ marginBottom: '$3' }}>
        This token is linked to variables in the following themes:
      </Text>
      <Stack direction="column" gap={2}>
        {references.map((reference) => (
          <ReferencedVariableEntry
            key={`${reference.themeId}-${tokenName}`}
            reference={reference}
            tokenName={tokenName}
            onDetach={handleDetachFromTheme}
          />
        ))}
      </Stack>
    </Box>
  );
};
