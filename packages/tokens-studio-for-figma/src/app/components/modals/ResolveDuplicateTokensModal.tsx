import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Stack, Text,
} from '@tokens-studio/ui';
import Modal from '../Modal';
import { tokensSelector } from '@/selectors';
import ResolveDuplicateTokenGroup from '../DuplicateResolver/ResolveDuplicateTokenGroup';
import { SingleToken } from '@/types/tokens';
import useManageTokens from '@/app/store/useManageTokens';
import { track } from '@/utils/analytics';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ResolveDuplicateTokensModal({
  isOpen, onClose,
}: Props) {
  const tokens = useSelector(tokensSelector);
  const { deleteDuplicates } = useManageTokens();
  const { t } = useTranslation(['tokens']);
  const [selectedTokens, setSelectedTokens] = useState<{ [setName: string]: { [tokenName: string]: number } }>(Object.keys(tokens).reduce((acc, setName) => {
    acc[setName] = {};
    return acc;
  }, {}));

  const { duplicateTokens, duplicateTokensToDelete } = useMemo<{
    duplicateTokens: { [key: string]: { [key: string]: SingleToken[] } },
    duplicateTokensToDelete: { [key: string]: { [tokenName: string]: number } }
  }>(() => {
    const duplicateTokensObj = Object.keys(tokens).reduce((acc, setName) => {
      const currentSetTokens = tokens[setName];
      const duplicatesByName = currentSetTokens.reduce((acc2, token) => {
        const allTokensWithName = currentSetTokens.filter((a) => a.name === token.name);
        if (allTokensWithName.length > 1) {
          acc2[token.name] = allTokensWithName.map((duplicateToken, i) => ({
            ...duplicateToken,
            selected: i === Number(selectedTokens?.[setName]?.[token.name] || 0),
          }));
        }

        return acc2;
      }, {});

      acc[setName] = duplicatesByName;
      return acc;
    }, {});

    const toDelete = Object.keys(duplicateTokensObj).reduce((acc, setName): { [key: string]: { [key: string]: number } } => {
      const tokensForSet = duplicateTokensObj[setName];

      const mappedDuplicateTokens = Object.keys(tokensForSet).reduce<{ [key: string]: number }>((acc2, tokenName) => {
        acc2[tokenName] = tokensForSet[tokenName].findIndex((val) => val.selected) as number;
        return acc2;
      }, {});

      acc[setName] = mappedDuplicateTokens;
      return acc;
    }, {} as { [key: string]: { [key: string]: number } });
    return { duplicateTokensToDelete: toDelete, duplicateTokens: duplicateTokensObj };
  }, [tokens, selectedTokens]);

  const onRadioClick = useCallback((value) => {
    const [setName, tokenName, index] = value.split(':');
    setSelectedTokens({
      ...selectedTokens,
      [setName]: {
        ...selectedTokens[setName],
        [tokenName]: index,
      },
    });
  }, [setSelectedTokens, selectedTokens]);

  const handleDuplicateTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const listToDel: { set: string, path: string, index: number }[] = [];
    Object.entries(duplicateTokensToDelete).forEach(([set, duplicates]) => {
      Object.keys(duplicates)?.forEach((duplicateName) => {
        const index = duplicates[duplicateName];
        listToDel.push({ set, path: duplicateName, index });
      });
    });
    track('Duplicate tokens removed', { count: listToDel.length });
    await deleteDuplicates(listToDel);
    onClose();
  }, [duplicateTokensToDelete, onClose, deleteDuplicates]);

  const canResolve = true; // Placeholder incase some error validation is needed

  return (
    <Modal
      title={t('resolveDuplicateTokensModal.title')}
      isOpen={isOpen}
      close={onClose}
      showClose
      size="large"
      footer={(
        <form id="resolveDuplicateTokenGroup" onSubmit={handleDuplicateTokenGroupSubmit}>
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={!canResolve}>
              {t('resolveDuplicateTokensModal.submit')}
            </Button>
          </Stack>
        </form>
    )}
    >
      <Stack direction="column" justify="center" align="start" gap={4}>
        <Text css={{ marginBottom: '$4' }}>
          {t('resolveDuplicateTokensModal.description')}
        </Text>
        {Object.entries(duplicateTokens).map(([setName, allTokens]) => ((Object.keys(allTokens).length > 0) ? (
          <Stack direction="column" key={`duplicateTokens-${setName}`}>
            <Text bold css={{ fontSize: '$large', marginBottom: '$5' }}>{setName}</Text>
            {Object.entries(allTokens).map(([tokenName, duplicates]) => (
              <ResolveDuplicateTokenGroup
                group={[tokenName, duplicates]}
                setName={setName}
                onRadioClick={onRadioClick}
                selectedTokens={selectedTokens}
              />
            ))}
          </Stack>
        ) : null))}
      </Stack>
    </Modal>
  );
}
