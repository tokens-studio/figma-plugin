import React from 'react';
import { styled } from '@/stitches.config';
import SubscriptionAccount from './SubscriptionAccount';

// ─── Sub-tab row: "Plans" and "Account" as pill buttons ─────────────

const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  flex: 1,
});

export default function Subscription() {
  // Hidden "Plans" tab to match main branch behavior
  return (
    <Wrapper className="content">
      <SubscriptionAccount />
    </Wrapper>
  );
}
