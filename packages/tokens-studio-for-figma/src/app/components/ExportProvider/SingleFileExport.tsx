import React from 'react';
import { useSelector } from 'react-redux';
import set from 'set-value';
import {
  Button, Heading, Textarea, Checkbox,
} from '@tokens-studio/ui';
import useTokens from '@/app/store/useTokens';
import {
  themesListSelector, tokensSelector,
} from '@/selectors';
import Label from '../Label';
import Box from '../Box';
import Stack from '../Stack';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { track } from '@/utils/analytics';

type Props = {
  onClose: () => void
};

export default function SingleFileExport({ onClose }: Props) {
  const { getFormattedTokens } = useTokens();
  const [includeAllTokens, setIncludeAllTokens] = React.useState(false);
  const [includeParent, setIncludeParent] = React.useState(true);
  const [expandTypography, setExpandTypography] = React.useState(false);
  const [expandShadow, setExpandShadow] = React.useState(false);
  const [expandComposition, setExpandComposition] = React.useState(false);
  const [expandBorder, setExpandBorder] = React.useState(false);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);

  const handleToggleIncludeAllTokens = React.useCallback(() => {
    setIncludeAllTokens(!includeAllTokens);
  }, [includeAllTokens]);

  const handleToggleIncludeParent = React.useCallback(() => {
    setIncludeParent(!includeParent);
  }, [includeParent]);

  const handleToggleExpandTypograhy = React.useCallback(() => {
    setExpandTypography(!expandTypography);
  }, [expandTypography]);

  const handleToggleExpandShadow = React.useCallback(() => {
    setExpandShadow(!expandShadow);
  }, [expandShadow]);

  const handleToggleExpandComposition = React.useCallback(() => {
    setExpandComposition(!expandComposition);
  }, [expandComposition]);

  const handleToggleExpandBorder = React.useCallback(() => {
    setExpandBorder(!expandBorder);
  }, [expandBorder]);

  const handleClickExport = React.useCallback(() => {
    track('Export file', {
      includeParent, includeAllTokens, expandComposition, expandShadow, expandTypography, expandBorder,
    });
    onClose();
  }, [expandComposition, expandShadow, expandTypography, expandBorder, includeAllTokens, includeParent, onClose]);

  const formattedTokens = React.useMemo(() => getFormattedTokens({
    includeAllTokens, includeParent, expandTypography, expandShadow, expandComposition, expandBorder,
  }), [includeAllTokens, includeParent, expandTypography, expandShadow, expandComposition, expandBorder, getFormattedTokens]);

  const exportData = React.useMemo(() => {
    const returnValue = JSON.parse(formattedTokens);
    if (includeAllTokens) {
      set(returnValue, SystemFilenames.THEMES, themes);
      set(returnValue, SystemFilenames.METADATA, {
        tokenSetOrder: Object.keys(tokens),
      });
    }
    return JSON.stringify(returnValue, null, 2);
  }, [formattedTokens, tokens, themes, includeAllTokens]);

  return (
    <Stack gap={4} direction="column">
      <Box css={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Checkbox
            id="includeAllTokens"
            checked={includeAllTokens}
            defaultChecked={includeAllTokens}
            onCheckedChange={handleToggleIncludeAllTokens}
          />
          <Label htmlFor="includeAllTokens">All token sets</Label>
        </Box>
        <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Checkbox
            disabled={includeAllTokens}
            id="includeParent"
            checked={includeParent}
            defaultChecked={includeParent}
            onCheckedChange={handleToggleIncludeParent}
          />
          <Label disabled={includeAllTokens} htmlFor="includeParent">
            Include parent key
          </Label>
        </Box>
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Heading size="small">Options</Heading>
        <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Checkbox
            id="expandTypography"
            checked={expandTypography}
            defaultChecked={expandTypography}
            onCheckedChange={handleToggleExpandTypograhy}
          />
          <Label htmlFor="expandTypography">Expand Typography</Label>
        </Box>
        <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Checkbox
            id="expandShadow"
            checked={expandShadow}
            defaultChecked={expandShadow}
            onCheckedChange={handleToggleExpandShadow}
          />
          <Label htmlFor="expandShadow">Expand Shadows</Label>
        </Box>
        <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Checkbox
            id="expandComposition"
            checked={expandComposition}
            defaultChecked={expandComposition}
            onCheckedChange={handleToggleExpandComposition}
          />
          <Label htmlFor="expandComposition">Expand Composition</Label>
        </Box>
        <Box css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Checkbox
            id="expandBorder"
            checked={expandBorder}
            defaultChecked={expandBorder}
            onCheckedChange={handleToggleExpandBorder}
          />
          <Label htmlFor="expandBorder">Expand Border</Label>
        </Box>
      </Box>
      <Heading size="small">Preview</Heading>
      <Textarea
        rows={10}
        disabled
        value={exportData}
        css={{
          fontFamily: '$mono',
          fontSize: '$xxsmall',
          lineHeight: '140%',
        }}
      />
      <Stack width="full" direction="row" justify="end" gap={4}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          as="a"
          href={`data:text/json;charset=utf-8,${encodeURIComponent(exportData)}`}
          // @ts-ignore Exception to allow setting the download prop here
          download="tokens.json"
          variant="primary"
          onClick={handleClickExport}
        >
          Export
        </Button>
      </Stack>
    </Stack>
  );
}
