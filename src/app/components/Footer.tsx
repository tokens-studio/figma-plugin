import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import * as pjs from '../../../package.json';
import Box from './Box';
import DocsIcon from '@/icons/docs.svg';
import FeedbackIcon from '@/icons/feedback.svg';
import Text from '@/app/components/Text';

export default function Footer() {
  const activeTab = useSelector((state: RootState) => state.uiState.activeTab);

  return (
    <div className={`p-4 flex-shrink-0 flex items-center justify-between ${activeTab === 'tokens' && 'mb-16'}`}>
      <div className="text-gray-600 text-xxs">
        Version
        {' '}
        {pjs.plugin_version}
      </div>
      <Box css={{ display: 'flex', gap: '$4' }}>
        <Text size="xsmall">
          <a
            className="flex items-center"
            href="https://docs.tokens.studio/?ref=pf"
            target="_blank"
            rel="noreferrer"
          >
            <span className="mr-1 text-gray-600">Docs</span>
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
            <span className="mr-1 text-gray-600">Feedback</span>
            <FeedbackIcon />
          </a>
        </Text>
      </Box>
    </div>
  );
}
