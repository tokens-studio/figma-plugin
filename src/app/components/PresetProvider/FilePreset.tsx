import React from 'react';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import useFile from '@/app/store/providers/file';
import Button from '../Button';
import Stack from '../Stack';

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
  const { readTokensFromFileOrDirectory } = useFile();

  const handleFileButtonClick = React.useCallback(() => {
    hiddenFileInput.current?.click();
  }, [hiddenFileInput]);

  const handleFileChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return;
    await readTokensFromFileOrDirectory(files);
    onCancel();
  }, [readTokensFromFileOrDirectory]);

  const handleDirectoryButtonClick = React.useCallback(() => {
    hiddenDirectoryInput.current?.click();
  }, [hiddenDirectoryInput]);

  const handleDirectoryChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return;
    await readTokensFromFileOrDirectory(files);
    onCancel();
  }, [readTokensFromFileOrDirectory]);

  return (
    <Stack direction="column" gap={2}>
      <p className="text-xs text-gray-600">
        Import your existing tokens JSON files into the plugin.
        {' '}
        <br />
        {' '}
        If you're using a single file, the first-level keys should be the token set names.
        {' '}
        <br />
        {' '}
        If you're using multiple files, the file name / path are the set names.
      </p>
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
            onChange={handleFileChange}
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
            onChange={handleDirectoryChange}
            accept=".json"
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
