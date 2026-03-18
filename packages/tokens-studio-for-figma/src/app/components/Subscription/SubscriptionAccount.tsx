import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DropdownMenu,
} from '@tokens-studio/ui';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { styled } from '@/stitches.config';
import { AddLicenseKey } from '../AddLicenseKey';
import { OAuthLogin } from '../Login/OAuthLogin';
import { useAuthStore } from '@/app/store/useAuthStore';
import { Divider } from '../Divider';

// ─── Styled ──────────────────────────────────────────────────────────

const ContentBox = styled('div', {
  padding: '$3',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4', // increased gap between cards
  overflowY: 'auto',
  flex: 1,
});

const Card = styled('div', {
  border: '1px solid $borderSubtle',
  borderRadius: '12px',
  overflow: 'hidden',
});

const CardSection = styled('div', {
  padding: '$4',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
});

const SectionRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$3',
});

const Avatar = styled('img', {
  width: 40,
  height: 40,
  borderRadius: '$full',
  objectFit: 'cover',
});

const AvatarFallback = styled('div', {
  width: 40,
  height: 40,
  borderRadius: '$full',
  backgroundColor: '$bgSubtle',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$fgMuted',
  fontSize: '$large',
});

const UserDataStack = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '2px',
});

const SectionTitle = styled('div', {
  fontSize: '13px',
  fontWeight: 600,
  color: '$fgDefault',
  marginBottom: '$3',
});

const ItemCard = styled('div', {
  backgroundColor: '$bgSubtle',
  borderRadius: '$medium',
  border: '1px solid $borderSubtle',
  padding: '$3 $4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const FlexGrid = styled('div', {
  display: 'flex',
  gap: '40px',
});

const ItemCardColumn = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const ItemCardLabel = styled('span', {
  fontSize: '12px',
  color: '$fgMuted',
});

const ItemCardValue = styled('span', {
  fontSize: '$small',
  color: '$fgDefault',
});

const OrgDropdownTriggerBtn = styled('button', {
  all: 'unset',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '$small',
  backgroundColor: '$bgDefault',
  padding: '4px 12px 4px 4px',
  borderRadius: '$medium',
  border: '1px solid $borderSubtle',
  color: '$fgDefault',
  '&:hover': {
    backgroundColor: '$bgSubtle',
  },
});

const StyledDropdownContent = styled(DropdownMenu.Content, {
  minWidth: 200,
  backgroundColor: '$bgDefault',
  borderRadius: '$medium',
  padding: '$2',
  boxShadow: '$default',
  border: '1px solid $borderSubtle',
  zIndex: 10,
});

const StyledDropdownItem = styled(DropdownMenu.Item, {
  fontSize: '$small',
  padding: '$2 $3',
  borderRadius: '$small',
  cursor: 'pointer',
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  color: '$fgDefault',
  '&:hover, &:focus': {
    backgroundColor: '$interaction',
    color: '$onInteraction',
  },
});

// ─── Component ───────────────────────────────────────────────────────

const getPlanName = (sub: any) => {
  if (!sub) return 'Starter';
  const name = (typeof sub.plan === 'string' ? sub.plan : undefined)
    || sub.plan?.name
    || sub.plan_name
    || sub.current_plan;

  if (!name) return 'Starter';
  return name;
};

export default function SubscriptionAccount() {
  // OAuth Auth store
  const {
    isAuthenticated,
    user,
    organizations,
    activeOrganization,
    setActiveOrganization,
    logout,
  } = useAuthStore();
  const { t } = useTranslation(['subscription', 'licence']);

  const handleManageOrg = useCallback(() => {
    if (activeOrganization) {
      window.open(`https://production.tokens.studio/organizations/${activeOrganization.id}`, '_blank');
    }
  }, [activeOrganization]);

  const handleManagePlan = useCallback(() => {
    if (activeOrganization) {
      window.open(`https://production.tokens.studio/organizations/${activeOrganization.id}/subscription`, '_blank');
    }
  }, [activeOrganization]);

  return (
    <ContentBox>
      <Card>
        {/* Authenticated Dashboard */}
        {isAuthenticated && user ? (
          <>
            <CardSection>
              {/* User Profile Header */}
              <SectionRow>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {user.avatar ? (
                    <Avatar src={user.avatar} alt="User avatar" />
                  ) : (
                    <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                  )}
                  <UserDataStack>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--colors-fgDefault)',
                      lineHeight: 1.2,
                    }}
                    >
                      {user.fullName || t('studioUser')}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--colors-fgMuted)',
                      lineHeight: 1.2,
                    }}
                    >
                      {user.email}
                    </span>
                  </UserDataStack>
                </div>
                <Button variant="secondary" onClick={logout}>
                  {t('logout')}
                </Button>
              </SectionRow>

              {organizations.length > 0 && activeOrganization && (
              <>
                <Divider css={{ margin: '0 -$4' }} />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
                >
                  <div>
                    <SectionTitle>{t('organisation')}</SectionTitle>
                    <ItemCard>
                      <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                          <OrgDropdownTriggerBtn>
                            {activeOrganization.avatarUrl ? (
                              <Avatar src={activeOrganization.avatarUrl} style={{ width: 24, height: 24, borderRadius: '4px' }} alt="" />
                            ) : (
                              <AvatarFallback style={{
                                width: 24,
                                height: 24,
                                fontSize: '12px',
                                borderRadius: '4px',
                              }}
                              >
                                {activeOrganization.name[0]}
                              </AvatarFallback>
                            )}
                            {activeOrganization.name}
                            <CaretDownIcon style={{ marginLeft: '4px', color: 'var(--colors-fgMuted)' }} />
                          </OrgDropdownTriggerBtn>
                        </DropdownMenu.Trigger>
                        <StyledDropdownContent>
                          {organizations.map((org) => (
                            <StyledDropdownItem
                              key={org.id}
                              // eslint-disable-next-line react/jsx-no-bind
                              onClick={() => setActiveOrganization(org.id)}
                            >
                              {org.avatarUrl && (
                                <Avatar src={org.avatarUrl} alt="" css={{ width: 16, height: 16, borderRadius: '2px' }} />
                              )}
                              {org.name}
                            </StyledDropdownItem>
                          ))}
                        </StyledDropdownContent>
                      </DropdownMenu>
                      <Button variant="secondary" onClick={handleManageOrg}>{t('manageOrg')}</Button>
                    </ItemCard>
                  </div>

                  <div>
                    <SectionTitle>{t('currentPlan')}</SectionTitle>
                    <ItemCard>
                      <FlexGrid>
                        <ItemCardColumn>
                          <ItemCardLabel>{t('plan')}</ItemCardLabel>
                          <ItemCardValue style={{ textTransform: 'capitalize' }}>{getPlanName(activeOrganization.subscription)}</ItemCardValue>
                        </ItemCardColumn>
                      </FlexGrid>
                      <Button variant="secondary" onClick={handleManagePlan}>{t('managePlan')}</Button>
                    </ItemCard>
                  </div>
                </div>
              </>
              )}
            </CardSection>

            <Divider css={{ margin: '0 -$4' }} />
            <CardSection>
              <AddLicenseKey isCompact />
            </CardSection>
          </>
        ) : (
          <>
            {/* If Not Authenticated, Show Login Component */}
            <CardSection>
              <OAuthLogin />
            </CardSection>

            {/* License key section - visible ONLY when NOT authenticated */}
            <Divider css={{ margin: '0 -$4' }} />
            <CardSection>
              <AddLicenseKey isCompact />
            </CardSection>
          </>
        )}
      </Card>
    </ContentBox>
  );
}
