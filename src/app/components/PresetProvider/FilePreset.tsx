import React from 'react';
import { useSelector } from 'react-redux';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import {
  usedTokenSetSelector,
  activeThemeSelector,
} from '@/selectors';
import useRemoteTokens from '../../store/remoteTokens';
import Button from '../Button';
import Stack from '../Stack';
import Heading from '../Heading';
import Text from '../Text';
import { track } from '@/utils/analytics';

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}

export type SingleFileObject = Record<string, (
  Record<string, SingleToken<false> | DeepTokensMap<false>>
)> & {
  $themes?: ThemeObjectsList
};

type Props = {
  onCancel: () => void;
};

export default function FilePreset({ onCancel }: Props) {
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const hiddenDirectoryInput = React.useRef<HTMLInputElement>(null);
  const { fetchTokensFromFileOrDirectory } = useRemoteTokens();

  const handleFileButtonClick = React.useCallback(() => {
    track('Import', { type: 'file' });
    hiddenFileInput.current?.click();
  }, [hiddenFileInput]);

  const handleDirectoryButtonClick = React.useCallback(() => {
    track('Import', { type: 'directory' });
    hiddenDirectoryInput.current?.click();
  }, [hiddenDirectoryInput]);

  const handleFileOrDirectoryChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    await fetchTokensFromFileOrDirectory({ files, usedTokenSet, activeTheme });
    onCancel();
  }, [fetchTokensFromFileOrDirectory, onCancel]);

  return (
    <Stack direction="column" gap={4}>
      <Stack direction="column" gap={2}>
        <Heading size="small">
          Import your existing tokens JSON files into the plugin.
        </Heading>
        <Text>
          If you&lsquo;re using a single file, the first-level keys should be the token set names. If you&lsquo;re using multiple files, the file name / path are the set names.
        </Text>
      </Stack>
      <Stack direction="row" gap={2} justify="end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleFileButtonClick}>
          Choose file
        </Button>
        <input
          type="file"
          ref={hiddenFileInput}
          style={{ display: 'none' }}
          onChange={handleFileOrDirectoryChange}
          accept=".json"
        />
        <Button variant="primary" onClick={handleDirectoryButtonClick}>
          Choose folder
        </Button>
        <input
          type="file"
          ref={hiddenDirectoryInput}
          style={{ display: 'none' }}
          webkitdirectory=""
          directory=""
          onChange={handleFileOrDirectoryChange}
        />
      </Stack>
    </Stack>
  );
}
