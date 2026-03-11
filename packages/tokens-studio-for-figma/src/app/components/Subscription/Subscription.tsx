import React, { useState, useCallback } from 'react';
import { styled } from '@/stitches.config';
import SubscriptionPlans from './SubscriptionPlans';
import SubscriptionAccount from './SubscriptionAccount';

type SubscriptionTab = 'plans' | 'account';

// ─── Sub-tab row: "Plans" and "Account" as pill buttons ─────────────

const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  flex: 1,
});

const TabRow = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  padding: '$3 $3 $2 $3',
  gap: '$2',
  flexShrink: 0,
});

const PillTab = styled('button', {
  padding: '$2 $4',
  borderRadius: '$medium',
  fontSize: '$xsmall',
  fontWeight: '$sansBold',
  cursor: 'pointer',
  border: '1px solid transparent',
  background: 'transparent',
  color: '$fgMuted',
  transition: 'all 0.15s ease',
  lineHeight: 1.4,
  '&:hover': {
    color: '$fgDefault',
    borderColor: '$borderSubtle',
  },
  variants: {
    active: {
      true: {
        color: '$fgDefault',
        border: '1px solid $borderMuted',
        background: '$bgSubtle',
      },
    },
  },
});

export default function Subscription() {
  const [activeTab, setActiveTab] = useState<SubscriptionTab>('account');

  const handleTabSwitch = useCallback((tab: SubscriptionTab) => {
    setActiveTab(tab);
  }, []);

  const handleSwitchAccount = useCallback(() => {
    handleTabSwitch('account');
  }, [handleTabSwitch]);

  return (
    <Wrapper className="content">
      <TabRow>
        <PillTab
          type="button"
          active={activeTab === 'account'}
          onClick={handleSwitchAccount}
        >
          Account
        </PillTab>
      </TabRow>

      {activeTab === 'plans' && <SubscriptionPlans />}
      {activeTab === 'account' && <SubscriptionAccount />}
    </Wrapper>
  );
}
