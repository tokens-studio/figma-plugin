import { FileDirectoryIcon } from '@primer/octicons-react';
import {
  Tabs, Stack, Heading, Button,
} from '@tokens-studio/ui';
import { Link, Label } from 'iconoir-react';
import React from 'react';
import { useSelector, useStore } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
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

  const handleCancelChangeSets = React.useCallback(() => {
    // DO NOT SAVE THE SET CHANGES
    setShowChangeSets(false);
  }, []);

  const handleSelectedSetChange = React.useCallback((set: string) => {
    if (selectedSets.includes(set)) {
      setSelectedSets(selectedSets.filter((id) => id !== set));
    } else {
      setSelectedSets([...selectedSets, set]);
    }
  }, []);



  const TokenSetThemeItemInput = React.useCallback((props: React.PropsWithChildren<{ item: TreeItem }>) => (
    <Controller
      name="tokenSets"
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
  ), []);

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
            { /* eslint-disable-next-line react/jsx-no-bind */}
            <Button variant="secondary" size="small" onClick={() => setShowChangeSets(true)}>Change Sets</Button>
            <ExportThemeRow>
              <FileDirectoryIcon size="small" />
              <Label>
                {selectedSets.length}
                {' of '}
                {allSets.length}
              </Label>
              {/*
                    TODO: Add details for the set exports
                    <ThemeDetails />
                    <IconButton variant="invisible" size="small" tooltip="Details" icon={<ChevronRightIcon />} />
                    */}
              <Modal size="fullscreen" full compact isOpen={showChangeSets} close={handleCancelChangeSets} showClose>
                <Heading>Enabled sets will export to Figma</Heading>
                <Link target="_blank" href={docsLinks.sets}>Learn more - Enabled vs set as source</Link>
                <Stack
                  direction="column"
                  gap={4}
                  css={{
                    marginBlockStart: '$4',
                  }}
                >
                  {
                /* TODO: Make this search filter the sets */
              }
                  <Input placeholder="Search sets" />
                  <TokenSetTreeContent items={treeOrListItems} renderItemContent={TokenSetThemeItemInput} keyPosition="end" />
                </Stack>
              </Modal>
            </ExportThemeRow>
          </Stack>
        </Stack>
      </StyledCard>
    </Tabs.Content>
  );
  return {
    ExportSetsTab,
    selectedSets,
  };
}
