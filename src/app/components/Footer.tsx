import * as React from 'react';
import * as pjs from '../../../package.json';
import Box from './Box';
import DocsIcon from '@/icons/docs.svg';
import FeedbackIcon from '@/icons/feedback.svg';
import Text from '@/app/components/Text';

export default function Footer() {
  return (
    <Box css={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, padding: '$4',
    }}
    >
      <Box css={{ color: '$textMuted', fontSize: '$xsmall' }}>
        Version
        {' '}
        {pjs.plugin_version}
      </Box>
      <Box css={{ display: 'flex', gap: '$4' }}>
        <Text size="xsmall">
          <a
            className="flex items-center"
            href="https://docs.tokens.studio/?ref=pf"
            target="_blank"
            rel="noreferrer"
          >
            <Box as="span" css={{ marginRight: '$1', color: '$textMuted' }}>Docs</Box>
            <DocsIcon />
          </a>
        </Text>
        <Text size="xsmall">
          <a
            className="flex items-center"
            href="https://github.com/six7/figma-tokens"
            target="_blank"
            rel="noreferrer"
          >
            <Box as="span" css={{ marginRight: '$1', color: '$textMuted' }}>Feedback</Box>
            <FeedbackIcon />
          </a>
        </Text>
      </Box>
    </Box>
  );
}
