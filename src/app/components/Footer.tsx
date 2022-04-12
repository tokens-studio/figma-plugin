import React from 'react';
import * as pjs from '../../../package.json';
import Box from './Box';
import DocsIcon from '@/icons/docs.svg';
import FeedbackIcon from '@/icons/feedback.svg';
import Text from '@/app/components/Text';
import Stack from './Stack';
import BranchSelector from './BranchSelector';

export default function Footer() {
  return (
    <Box css={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, padding: '$4',
    }}
    >
      <BranchSelector />
      <Stack direction="row" gap={4}>
        <Box css={{ color: '$textMuted', fontSize: '$xsmall' }}>
          Version
          {' '}
          {pjs.plugin_version}
        </Box>

        <Text size="xsmall">
          <a
            href="https://docs.tokens.studio/?ref=pf"
            target="_blank"
            rel="noreferrer"
          >
            <Stack direction="row" gap={1}>
              <Box as="span" css={{ color: '$textMuted' }}>Docs</Box>
              <DocsIcon />
            </Stack>
          </a>
        </Text>
        <Text size="xsmall">
          <a
            href="https://github.com/six7/figma-tokens"
            target="_blank"
            rel="noreferrer"
          >
            <Stack direction="row" gap={1}>
              <Box as="span" css={{ color: '$textMuted' }}>Feedback</Box>
              <FeedbackIcon />
            </Stack>
          </a>
        </Text>
      </Stack>
    </Box>
  );
}
