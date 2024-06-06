import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, Stack } from '@tokens-studio/ui';
import Modal from '../Modal';
import { MultiSelectDropdown } from '../MultiSelectDropdown';
import { ErrorMessage } from '../ErrorMessage';
import { activeTokenSetSelector, tokensSelector } from '@/selectors';
import useManageTokens from '@/app/store/useManageTokens';
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
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const [selectedTokenSets, setSelectedTokenSets] = React.useState<string[]>([activeTokenSet]);
  // const { duplicateGroup } = useManageTokens();
  const { t } = useTranslation(['tokens']);
  const activeSetTokens = tokens[activeTokenSet];

  const duplicateTokens: { [key: string]: SingleToken[] } = useMemo(() => {
    const duplicatesByName = activeSetTokens.reduce((acc, token) => {
      const allTokensWithName = activeSetTokens.filter((a) => a.name === token.name);
      if (allTokensWithName.length > 1) {
        acc[token.name] = allTokensWithName;
      }

      return acc;
    }, {});
    // const duplicates = activeSetTokens.filter((a) => activeSetTokens.filter((b) => a.name === b.name).length > 0);

    return duplicatesByName;
  }, [activeSetTokens]);
  console.log({ duplicateTokens });

  const handleSelectedItemChange = React.useCallback((selectedItems: string[]) => {
    setSelectedTokenSets(selectedItems);
  }, []);

  const handleDuplicateTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // duplicateGroup({
    //   oldName, newName, tokenSets: selectedTokenSets, type,
    // });
    onClose();
  // }, [duplicateGroup, oldName, newName, selectedTokenSets, type, onClose]);
  }, []);

  // const canDuplicate = React.useMemo(() => {
  //   // const isDuplicated = Object.entries(tokens).some(([tokenSetKey, tokenList]) => {
  //   //   if (selectedTokenSets.includes(tokenSetKey)) {
  //   //     return tokenList.some((token) => token.name.startsWith(`${newName}.`) || token.name === newName);
  //   //   }
  //   //   return false;
  //   // });
  //   // return !isDuplicated;
  // }, [tokens, newName, selectedTokenSets]);

  return (
    <Modal
      title="Resolve Duplicate Groups"
      isOpen={isOpen}
      close={onClose}
      size="large"
      footer={(
        <form id="duplicateTokenGroup" onSubmit={handleDuplicateTokenGroupSubmit}>
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
            {/* <Button type="submit" variant="primary" disabled={!canDuplicate}>
              {t('duplicate')}
            </Button> */}
          </Stack>
        </form>
    )}
    >
      <Stack direction="column" justify="center" align="start" gap={4}>
        {Object.entries(duplicateTokens).map(([tokenName, duplicates]) => (
          <ResolveDuplicateTokenGroup
            group={[tokenName, duplicates]}
            resolvedTokens={[]}
          />
        ))}
        {/* <TextInput
          form="duplicateTokenGroup"
          onChange={handleNewTokenGroupNameChange}
          type="text"
          name="tokengroupname"
          value={newName}
          autoFocus
          required
          css={{ width: '100%' }}
        />
        {!canDuplicate && (
          <ErrorMessage css={{ width: '100%' }}>
            {t('duplicateGroupError')}
          </ErrorMessage>
        )} */}
        <MultiSelectDropdown menuItems={Object.keys(tokens)} selectedItems={selectedTokenSets} handleSelectedItemChange={handleSelectedItemChange} />
      </Stack>
    </Modal>
  );
}
