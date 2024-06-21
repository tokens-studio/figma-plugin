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

function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type SingleTokenWithSelected = SingleToken & { selected?: boolean };

export default function ResolveDuplicateTokensModal({
  isOpen, onClose,
}: Props) {
  const tokens = useSelector(tokensSelector);
  const { t } = useTranslation(['tokens']);
  const [selectedTokens, setSelectedTokens] = useState<{ [setName: string]: { [tokenName: string]: number } }>(Object.keys(tokens).reduce((acc, setName) => {
    acc[setName] = {};
    return acc;
  }, {}));

  const { duplicateTokens, duplicateTokensToDelete } = useMemo<{
    duplicateTokens: { [key: string]: { [key: string]: SingleToken[] } },
    duplicateTokensToDelete: { [key: string]: SingleToken[] }
  }>(() => {
    const duplicateTokensObj = Object.keys(tokens).reduce((acc, setName) => {
      const currentSetTokens = tokens[setName];
      const duplicatesByName = currentSetTokens.reduce((acc2, token) => {
        const allTokensWithName = currentSetTokens.filter((a) => a.name === token.name);
        if (allTokensWithName.length > 1) {
          acc2[token.name] = allTokensWithName.map((duplicateToken, i) => ({ ...duplicateToken, selected: i === 0 }));
        }
  
        return acc2;
      }, {});
  
      acc[setName] = duplicatesByName;
      return acc;
    }, {});

    const toDelete = Object.keys(duplicateTokensObj).reduce((acc, setName): { [key: string]: SingleTokenWithSelected[] } => {
      const tokensForSet = duplicateTokensObj[setName];
      const mappedDuplicateTokens = Object.keys(tokensForSet).flatMap((tokenName) => tokensForSet[tokenName].filter((token: SingleTokenWithSelected, i) => {
        return i !== selectedTokens?.[setName]?.[tokenName] && !token.selected;
      }).map((token) => ({ ...token, name: tokenName, set: setName })));
  
      // acc.push(mappedDuplicateTokens);
      acc[setName] = mappedDuplicateTokens;
      return acc;
    }, {} as { [key: string]: SingleTokenWithSelected[] });
    return { duplicateTokensToDelete: toDelete, duplicateTokens: duplicateTokensObj }
  }, [tokens]);

  const onRadioClick = useCallback((value) => {
    const [setName, tokenName, index] = value.split(':');
    setSelectedTokens({
      ...selectedTokens,
      [setName]: {
        ...selectedTokens[setName],
        [tokenName]: index,
      },
    });
    //   return acc;
    // }, {});
  }, [setSelectedTokens, selectedTokens]);

  const handleDuplicateTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // duplicateGroup({
    //   oldName, newName, tokenSets: selectedTokenSets, type,
    // });
    // console.log({ duplicateTokensToDelete });
    onClose();
  // }, [duplicateGroup, oldName, newName, selectedTokenSets, type, onClose]);
  }, []);

  const canResolve = true;

  return (
    <Modal
      title={t('resolveDuplicateTokensModal.title')}
      isOpen={isOpen}
      close={onClose}
      size="large"
      footer={(
        <form id="resolveDuplicateTokenGroup" onSubmit={handleDuplicateTokenGroupSubmit}>
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={!canResolve}>
              Resolve Duplicates
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
                // tokens={tokens}
                // resolvedTokens={resolvedTokens}
              />
            ))}
          </Stack>
        ) : null))}
      </Stack>
    </Modal>
  );
}
