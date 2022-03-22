import React from 'react';
import useTokens from '@/app/store/useTokens';
import Heading from '../Heading';
import Textarea from '../Textarea';
import Button from '../Button';
import Modal from '../Modal';
import Checkbox from '../Checkbox';
import Label from '../Label';
import Box from '../Box';

export default function ExportModal({ onClose }) {
  const { getFormattedTokens } = useTokens();
  const [includeAllTokens, setIncludeAllTokens] = React.useState(false);
  const [includeParent, setIncludeParent] = React.useState(true);
  const [expandTypography, setExpandTypography] = React.useState(false);
  const [expandShadow, setExpandShadow] = React.useState(false);

  return (
    <Modal large isOpen close={onClose}>
      <div className="flex flex-col space-y-4 w-full">
        <Heading>Export</Heading>
        <p className="text-xs">
          This is an early version of a tokens export, if you encounter any issues please raise an
          {' '}
          <a
            target="_blank"
            rel="noreferrer"
            className="underline"
            href="https://github.com/six7/figma-tokens/issues"
          >
            issue
          </a>
          .
        </p>
        <Box css={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Checkbox
              id="includeAllTokens"
              checked={includeAllTokens}
              defaultChecked={includeAllTokens}
              onCheckedChange={() => setIncludeAllTokens(!includeAllTokens)}
            />
            <Label htmlFor="includeAllTokens">All token sets</Label>
          </Box>
          <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Checkbox
              disabled={includeAllTokens}
              id="includeParent"
              checked={includeParent}
              defaultChecked={includeParent}
              onCheckedChange={() => setIncludeParent(!includeParent)}
            />
            <Label disabled={includeAllTokens} htmlFor="includeParent">
              Include parent key
            </Label>
          </Box>
          <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Checkbox
              id="expandTypography"
              checked={expandTypography}
              defaultChecked={expandTypography}
              onCheckedChange={() => setExpandTypography(!expandTypography)}
            />
            <Label htmlFor="expandTypography">Expand Typography</Label>
          </Box>
          <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Checkbox
              id="expandShadow"
              checked={expandShadow}
              defaultChecked={expandShadow}
              onCheckedChange={() => setExpandShadow(!expandShadow)}
            />
            <Label htmlFor="expandShadow">Expand Shadows</Label>
          </Box>
        </Box>

        <Heading size="small">Output example</Heading>
        <Textarea
          className="grow"
          rows={10}
          isDisabled
          value={getFormattedTokens({
            includeAllTokens, includeParent, expandTypography, expandShadow,
          })}
        />
        <div className="space-x-4 flex justify-between">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              getFormattedTokens({
                includeAllTokens, includeParent, expandTypography, expandShadow,
              }),
            )}`}
            download="tokens.json"
            variant="primary"
            size="large"
          >
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
}
