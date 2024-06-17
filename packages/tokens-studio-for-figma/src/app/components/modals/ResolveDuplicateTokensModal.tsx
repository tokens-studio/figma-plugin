import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Stack, Text,
} from '@tokens-studio/ui';
import Modal from '../Modal';
import { tokensSelector } from '@/selectors';
import ResolveDuplicateTokenGroup from '../DuplicateResolver/ResolveDuplicateTokenGroup';
import { SingleToken } from '@/types/tokens';

type Props = {
  isOpen: boolean;
  // type: string;
  // newName: string;
  // oldName: string;
  onClose: () => void;
  // handleNewTokenGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ResolveDuplicateTokensModal({
  isOpen, onClose,
  // isOpen, type, newName, oldName, onClose, handleNewTokenGroupNameChange,
}: Props) {
  const tokens = useSelector(tokensSelector);
  const { t } = useTranslation(['tokens']);
  // const [selectedTokens, setSelectedTokens]

  const [duplicateTokens, setDuplicateTokens] = useState<{ [key: string]: { [key: string]: SingleToken[] } }>(Object.keys(tokens).reduce((acc, setName) => {
    const currentSetTokens = tokens[setName];
    const duplicatesByName = currentSetTokens.reduce((acc2, token) => {
      const allTokensWithName = currentSetTokens.filter((a) => a.name === token.name);
      if (allTokensWithName.length > 1) {
        acc2[token.name] = allTokensWithName.map((t, i) => ({ ...t, selected: i === 0 }));
      }

      return acc2;
    }, {});

    acc[setName] = duplicatesByName;
    return acc;
  }, {}));

  // const onRadioClick = useCallback((setName, tokenName, index) => {
  //   // const updatedTokens = typeof duplicateTokens?[setName]?[tokenName]?.selected !== 'undefined' ? duplicateTokens?[setName]?[tokenName]?.selected = !duplicateTokens?[setName]?[tokenName]?.selected : undefined;
  //   // const patchedDuplicateTokens = Object.entries(duplicateTokens).reduce((acc, [setName, setTokens]) => {
  //   //   if

  //   //   return acc;
  //   // }, {});
  //   if (typeof duplicateTokens?[setName]?[tokenName]?.selected !== 'undefined') {
  //     setDuplicateTokens({
  //       ...duplicateTokens,
  //       [setName]: {
  //         ...duplicateTokens[setName],
  //         [tokenName]
  //       }
  //     })
  //   }
  // }, []);

  const handleDuplicateTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // duplicateGroup({
    //   oldName, newName, tokenSets: selectedTokenSets, type,
    // });
    onClose();
  // }, [duplicateGroup, oldName, newName, selectedTokenSets, type, onClose]);
  }, []);

  const canResolve = false;

  return (
    <Modal
      title="Resolve Duplicate Groups"
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
              {t('duplicate')}
              Resolve Duplicates
            </Button>
          </Stack>
        </form>
    )}
    >
      <Stack direction="column" justify="center" align="start" gap={4}>
        {Object.entries(duplicateTokens).map(([setName, allTokens]) => ((Object.keys(allTokens).length > 0) ? (
          <Stack direction="column" key={`duplicateTokens-${setName}`}>
            <Text bold css={{ fontSize: '$large', marginBottom: '$2' }}>{setName}</Text>
            {Object.entries(allTokens).map(([tokenName, duplicates]) => (
              <ResolveDuplicateTokenGroup
                group={[tokenName, duplicates]}
                set={setName}
                tokens={tokens}
                // resolvedTokens={resolvedTokens}
              />
            ))}
          </Stack>
        ) : null))}
      </Stack>
    </Modal>
  );
}
