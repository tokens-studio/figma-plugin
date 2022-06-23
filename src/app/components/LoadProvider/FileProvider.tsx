import React from 'react';
import Button from '../Button';
import Stack from '../Stack';
import IsJSONString from '@/utils/isJSONString';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { AnyTokenSet, SingleToken } from '@/types/tokens';

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
  const [fileList, setFileList] = React.useState<FileList>();

  const readFileContents = (files: FileList) => {
    const reader = new FileReader();
    let result: string | ArrayBuffer | null = '';
    if (files.length > 1) {
      // const fileContents = files.map((file) => {
      //   reader.readAsText(file);
      //   reader.onload = () => {
      //     const result = reader.result;
      //     return result;
      //   }
      // });
    }
    reader.readAsText(files[0]);
    reader.onload = () => {
      result = reader.result;
    };
    return result;
  };

  const handleFileButtonClick = React.useCallback(() => {
    hiddenFileInput.current?.click();
  }, [hiddenFileInput]);

  const handleFileChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return [];
    const path = files[0].webkitRelativePath;
    const data = readFileContents(files);
    console.log("fileconte", data)
    if (IsJSONString(data)) {
      const parsed = JSON.parse(data) as SingleFileObject;
      return [
        {
          type: 'themes',
          path: `${path}/$themes.json`,
          data: parsed.$themes ?? [],
        },
        ...(Object.entries(parsed).filter(([key]) => key !== '$themes') as [string, AnyTokenSet<false>][]).map(([name, tokenSet]) => ({
          name,
          type: 'tokenSet',
          path: `${path}/${name}.json`,
          data: tokenSet,
        })),
      ];
    }
    return [];
  }, [fileList]);

  

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
  }, [fileList]);


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
          accept='*.json'
        />
        <Button variant="primary" onClick={handleDirectoryButtonClick}>
          Choose folder
        </Button>
        <input
          type="file"
          ref={hiddenDirectoryInput}
          style={{ display: 'none' }}
          webkitdirectory=''
          directory=''
          onChange={handleDirectoryChange}
        />
      </Stack>
    </Stack>
  );
}
