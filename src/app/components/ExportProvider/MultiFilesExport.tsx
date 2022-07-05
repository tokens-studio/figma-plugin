import React from 'react';
import { useSelector } from 'react-redux';
import { useUIDSeed } from 'react-uid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import convertTokensToObject from '@/utils/convertTokensToObject';
import Button from '../Button';
import Stack from '../Stack';
import Heading from '../Heading';
import { IconFile } from '@/icons';
import { tokensSelector, themesListSelector } from '@/selectors';

type Props = {
  onCancel: () => void;
};

export default function MultiFilesExport({ onCancel }: Props) {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const seed = useUIDSeed();

  const filesChangeset = React.useMemo(() => {
    const changeObj: Record<string, string> = {};
    Object.entries(convertTokensToObject(tokens)).forEach(([key, value]) => {
      changeObj[`${key}.json`] = JSON.stringify(value, null, 2);
    });
    if (themes) changeObj['$themes.json'] = JSON.stringify(themes, null, 2);
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
    onCancel();
  }, [filesChangeset, onCancel]);

  return (
    <Stack direction="column" gap={4}>
      <Heading size="medium">Preview</Heading>
      <Stack direction="column" gap={3} className="content content-dark scroll-container" css={{ maxHeight: '$previewMaxHeight' }}>
        {
          Object.keys(filesChangeset)?.map((key, index) => (
            <Stack direction="row" gap={3} key={seed(index)}>
              <IconFile />
              {key}
            </Stack>
          ))
        }
      </Stack>
      <Stack width="full" direction="row" justify="end" gap={4}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={downLoadDataAsZip}>
          Export
        </Button>
      </Stack>
    </Stack>
  );
}
