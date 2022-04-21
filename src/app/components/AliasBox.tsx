import React from 'react';
import { styled } from '@/stitches.config';

const AliasStyleBox = styled('div', {
  backgroundColor: '#f5f5f5',
  wordWrap: 'break-word',
  color: '#616161 !important',
  fontSize: '0.7rem !important',
  fontFamily: 'JetBrainsMono, monospace !important',
  padding: '0.5rem !important;',
  display: 'flex',
});

type AliasProps = {
  children: React.ReactNode;
};

function AliasBox({
  children,
}: AliasProps) {
  return (
    <AliasStyleBox>
      {children}
    </AliasStyleBox>
  );
}

export default AliasBox;
