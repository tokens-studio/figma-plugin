import React from 'react';
import { useSelector } from 'react-redux';
import { useUIDSeed } from 'react-uid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button, Heading } from '@tokens-studio/ui';
import convertTokensToObject from '@/utils/convertTokensToObject';
import Stack from '../Stack';
import { IconFile } from '@/icons';
import {
  tokensSelector, themesListSelector, storeTokenIdInJsonEditorSelector,
} from '@/selectors';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { track } from '@/utils/analytics';

type Props = {
  onClose: () => void;
};

export default function MultiFilesExport({ onClose }: Props) {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const seed = useUIDSeed();

  const filesChangeset = React.useMemo(() => {
    const changeObj: Record<string, string> = {};
    Object.entries(convertTokensToObject(tokens, storeTokenIdInJsonEditor)).forEach(([key, value]) => {
      changeObj[`${key}.json`] = JSON.stringify(value, null, 2);
    });
    changeObj[`${SystemFilenames.THEMES}.json`] = JSON.stringify(themes, null, 2);
    const metadata = {
      tokenSetOrder: Object.keys(tokens),
    };
    changeObj[`${SystemFilenames.METADATA}.json`] = JSON.stringify(metadata, null, 2);
    return changeObj;
  }, [tokens, themes]);

  const downLoadDataAsZip = React.useCallback(() => {
    const zip = new JSZip();
    Object.entries(filesChangeset)?.forEach(([key, value]) => {
      zip.file(key, value);
    });
    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        saveAs(content, 'tokens.zip');
      });
    track('Export directory');

    onClose();
  }, [filesChangeset, onClose]);

  return (
    <Stack direction="column" gap={4}>
      <Heading size="small">Preview</Heading>
      <Stack
        direction="column"
        gap={3}
        className="content scroll-container"
        css={{
          border: '1px solid',
          borderColor: '$borderSubtle',
          padding: '$4',
          borderRadius: '$small',
          maxHeight: '200px',
        }}
      >
        {
          Object.keys(filesChangeset)?.map((key, index) => (
            <Stack direction="row" align="start" gap={3} css={{ fontSize: '$xsmall' }} key={seed(index)}>
              <IconFile />
              {key}
            </Stack>
          ))
        }
      </Stack>
      <Stack width="full" direction="row" justify="end" gap={4}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={downLoadDataAsZip}>
          Export
        </Button>
      </Stack>
    </Stack>
  );
}
