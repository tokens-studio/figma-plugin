import React from 'react';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import Button from '../Button';
import Stack from '../Stack';
import useFile from '@/app/store/providers/file';

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

export default function FileProvider({ onCancel }: Props) {
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const hiddenDirectoryInput = React.useRef<HTMLInputElement>(null);
  const { readTokensFromFile } = useFile();

  const handleFileButtonClick = React.useCallback(() => {
    hiddenFileInput.current?.click();
  }, [hiddenFileInput]);

  const handleFileChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return;
    await readTokensFromFile(files, files[0].webkitRelativePath);
  }, [readTokensFromFile]);

  const handleDirectoryButtonClick = React.useCallback(() => {
    hiddenDirectoryInput.current?.click();
  }, [hiddenDirectoryInput]);

  const handleDirectoryChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // const files = event.target.files;
    // if (!files) return;
    // setFileList(files);
    // const reader = new FileReader();
    // reader.readAsText(files[0]);
    // reader.onload = () => {
    //   const result = reader.result;
    // }
  }, []);

  return (
    <Stack direction="column" gap={2}>
      <p className="text-xs text-gray-600">
        Import your existing tokens JSON files into the plugin. If you're using a single file, the first-level keys should be the token set names. If you're using multiple files, the file name / path are the set names.
      </p>
      <Stack direction="row" gap={4} justify="between">
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
          onChange={handleFileChange}
          accept="*.json"
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
        />
      </Stack>
    </Stack>
  );
}
