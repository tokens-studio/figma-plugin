import React from 'react';
import { styled } from '@/stitches.config';
import SubscriptionAccount from './SubscriptionAccount';

// ─── Styled ──────────────────────────────────────────────────────────

const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  flex: 1,
});

export default function Subscription() {
  return (
    <Wrapper className="content">
      <SubscriptionAccount />
    </Wrapper>
  );
}
