import React from 'react';
import { useSelector } from 'react-redux';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import convertTokensToObject from '@/utils/convertTokensToObject';
import Button from '../Button';
import Stack from '../Stack';
import Heading from '../Heading';
import { IconFile } from '@/icons';
import Box from '../Box';
import { tokensSelector, themesListSelector } from '@/selectors';

type Props = {
  onCancel: () => void;
};

export default function MultiFilesExport({ onCancel }: Props) {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);

  const tokenSetObjects = React.useMemo(() => convertTokensToObject(tokens), [convertTokensToObject]);

  const handleExportButtonClick = React.useCallback(() => {
    const zip = new JSZip();
    Object.entries(tokenSetObjects).forEach(([key, value]) => {
      console.log('haah');
      zip.file(`${key}.json`, JSON.stringify(value, null, 2));
    });
    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        saveAs(content, 'tokens.zip');
      });
    onCancel();
  }, [tokenSetObjects, onCancel]);

  return (
    <Stack direction="column" gap={4}>
      <Heading size="small">Preview</Heading>
      <Stack direction="column" gap={3} css={{ height: '80px' }}>
        {
          Object.keys(tokenSetObjects).map((key) => (
            <Box>
              <IconFile />
              {key}
            </Box>
          ))
        }
      </Stack>
      <Stack width="full" direction="row" justify="end" gap={4}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleExportButtonClick}>
          Export
        </Button>
      </Stack>
    </Stack>
  );
}
