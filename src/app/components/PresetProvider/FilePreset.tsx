import React from 'react';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import useRemoteTokens from '../../store/remoteTokens';
import Button from '../Button';
import Stack from '../Stack';
import Heading from '../Heading';

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
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const hiddenDirectoryInput = React.useRef<HTMLInputElement>(null);
  const { fetchTokensFromFileOrDirectory } = useRemoteTokens();

  const handleFileButtonClick = React.useCallback(() => {
    hiddenFileInput.current?.click();
  }, [hiddenFileInput]);

  const handleDirectoryButtonClick = React.useCallback(() => {
    hiddenDirectoryInput.current?.click();
  }, [hiddenDirectoryInput]);

  const handleFileOrDirectoryChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    await fetchTokensFromFileOrDirectory(files);
    onCancel();
  }, [fetchTokensFromFileOrDirectory]);

  return (
    <Stack direction="column" gap={4}>
      <Heading size="small">
        Import your existing tokens JSON files into the plugin.
        {' '}
        <br />
        {' '}
        If you're using a single file, the first-level keys should be the token set names.
        {' '}
        <br />
        {' '}
        If you're using multiple files, the file name / path are the set names.
      </Heading>
      <Stack direction="row" gap={4} justify="between">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Stack direction="row" gap={3}>
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
    </Stack>
  );
}
