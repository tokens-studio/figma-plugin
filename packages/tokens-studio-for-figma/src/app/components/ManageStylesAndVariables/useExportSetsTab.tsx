import { FileDirectoryIcon } from '@primer/octicons-react';
import {
  Tabs, Stack, Heading, Button, Link, Label,
} from '@tokens-studio/ui';
import React from 'react';
import { useSelector, useStore } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { filter } from 'jszip';
import Input from '../Input';
import Modal from '../Modal';
import { TokenSetTreeContent } from '../TokenSetTree/TokenSetTreeContent';
import { StyledCard } from './StyledCard';
import { useIsGitMultiFileEnabled } from '@/app/hooks/useIsGitMultiFileEnabled';
import { ExportThemeRow } from './ExportThemeRow';
import { allTokenSetsSelector, usedTokenSetSelector } from '@/selectors';
import { docsLinks } from './docsLinks';
import { RootState } from '@/app/store';
import { tokenSetListToTree, tokenSetListToList, TreeItem } from '@/utils/tokenset';
import { TokenSetThemeItem } from '../ManageThemesModal/TokenSetThemeItem';
import { FormValues } from '../ManageThemesModal/CreateOrEditThemeForm';

export default function useExportSetsTab() {
  const store = useStore<RootState>();

  const [showChangeSets, setShowChangeSets] = React.useState(false);

  const allSets = useSelector(allTokenSetsSelector);
  const [selectedSets, setSelectedSets] = React.useState<string[]>(allSets.map((set) => set));

  const githubMfsEnabled = useIsGitMultiFileEnabled();
  const selectedTokenSets = React.useMemo(() => (
    usedTokenSetSelector(store.getState())
  ), [store]);

  const availableTokenSets = useSelector(allTokenSetsSelector);

  const treeOrListItems = React.useMemo(() => (
    githubMfsEnabled
      ? tokenSetListToTree(availableTokenSets)
      : tokenSetListToList(availableTokenSets)
  ), [githubMfsEnabled, availableTokenSets]);

  const [filteredItems, setFilteredItems] = React.useState(treeOrListItems);

  const handleFilterTree = React.useCallback(
    (event) => {
      const value = event?.target.value;
      const filtered = treeOrListItems.filter((item) => item.path.toLowerCase().includes(value.toLowerCase()));
      setFilteredItems(filtered);
    },
    [treeOrListItems],
  );

  const handleCancelChangeSets = React.useCallback(() => {
    // DO NOT SAVE THE SET CHANGES
    setShowChangeSets(false);
  }, []);



  const handleShowChangeSets = React.useCallback(() => {
    setShowChangeSets(true);
  }, []);

  const { control } = useForm<FormValues>({
    defaultValues: {
      tokenSets: { ...selectedTokenSets },
    },
  });

  const TokenSetThemeItemInput = React.useCallback((props: React.PropsWithChildren<{ item: TreeItem }>) => (
    <Controller
      name="tokenSets"
      control={control}
      // this is the only way to do this
      // eslint-disable-next-line
      render={({ field }) => (
        <TokenSetThemeItem
          {...props}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  ), [control]);

  const ExportSetsTab = () => (
    <Tabs.Content value="useSets">
      <StyledCard>
        <Stack direction="column" align="start" gap={6}>
          <Stack direction="column" align="start" gap={4}>
            <Heading>Confirm Sets</Heading>
            <p>You can use token sets to manage your styles, and variables.</p>
            <p>Use Themes (Pro) to create multiple collections of variables or styles for easy switching between design concepts. </p>
            <Link target="_blank" href={docsLinks.stylesAndVariables}>Learn more - Styles and variables</Link>
          </Stack>
          <Stack direction="column" align="start" gap={4}>
            <Button variant="secondary" size="small" onClick={handleShowChangeSets}>Change Sets</Button>
            <ExportThemeRow>
              <FileDirectoryIcon size="small" />
              <Label>
                {selectedSets.length}
                {' of '}
                {allSets.length}
              </Label>
            </ExportThemeRow>
          </Stack>
        </Stack>
      </StyledCard>
      <Modal size="fullscreen" full compact isOpen={showChangeSets} close={handleCancelChangeSets} backArrow title="Styles and Varibales / Export Sets">
        <Heading>Enabled sets will export to Figma</Heading>
        <Link target="_blank" href={docsLinks.sets}>Learn more - Enabled vs set as source</Link>
        <Stack
          direction="column"
          gap={4}
          css={{
            marginBlockStart: '$4',
          }}
        >
          <Input placeholder="Search sets" onInput={handleFilterTree} />
          <TokenSetTreeContent items={filteredItems} renderItemContent={TokenSetThemeItemInput} keyPosition="end" />
        </Stack>
      </Modal>
    </Tabs.Content>
  );
  return {
    ExportSetsTab,
    selectedSets,
  };
}
