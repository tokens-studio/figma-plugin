import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  TextInput,
  DropdownMenu,
} from '@tokens-studio/ui';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { styled } from '@/stitches.config';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import { userIdSelector } from '@/selectors/userIdSelector';
import { Dispatch } from '@/app/store';
import { AddLicenseSource } from '@/app/store/models/userState';
import { addLicenseKey } from '@/utils/addLicenseKey';
import useConfirm from '@/app/hooks/useConfirm';
import { OAuthLogin } from '../Login/OAuthLogin';
import { useAuthStore } from '@/app/store/useAuthStore';
import { ErrorMessage } from '../ErrorMessage';
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

const SectionCaption = styled('p', {
  fontSize: '$xsmall',
  color: '$fgMuted',
  lineHeight: 1.5,
  margin: 0,
});

const InlineLink = styled('a', {
  color: '#5ba4f5',
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
});

const InputRow = styled('div', {
  display: 'flex',
  gap: '$2',
  alignItems: 'flex-start',
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

export default function SubscriptionAccount() {
  const dispatch = useDispatch<Dispatch>();
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const userId = useSelector(userIdSelector);

  // OAuth Auth store
  const {
    isAuthenticated,
    user,
    organizations,
    activeOrganization,
    setActiveOrganization,
    logout,
  } = useAuthStore();

  const { confirm } = useConfirm();

  const [newKey, setNewKey] = useState(existingKey ?? '');

  useEffect(() => {
    setNewKey(existingKey ?? '');
  }, [existingKey]);

  const handleKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewKey(e.target.value.trim());
  }, []);

  const handleAddKey = useCallback(async () => {
    if (newKey) {
      await addLicenseKey(
        dispatch,
        { key: newKey, source: AddLicenseSource.UI },
        { userId },
      );
    }
  }, [newKey, dispatch, userId]);

  const handleRemoveKey = useCallback(async () => {
    if (licenseKeyError) {
      dispatch.userState.removeLicenseKey(undefined);
    } else {
      const confirmed = await confirm({
        text: 'Remove license key?',
        description: 'Keep your license key somewhere safe.',
        confirmAction: 'Remove key',
      });
      if (confirmed) {
        dispatch.userState.removeLicenseKey(undefined);
      }
    }
  }, [licenseKeyError, confirm, dispatch]);

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
      {/* Authenticated Dashboard */}
      {isAuthenticated && user ? (
        <Card>
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
                    fontSize: '13px', fontWeight: 600, color: 'var(--colors-fgDefault)', lineHeight: 1.2,
                  }}
                  >
                    {user.fullName || 'Studio User'}
                  </span>
                  <span style={{
                    fontSize: '12px', color: 'var(--colors-fgMuted)', lineHeight: 1.2,
                  }}
                  >
                    {user.email}
                  </span>
                </UserDataStack>
              </div>
              <Button variant="secondary" onClick={logout}>
                Log out
              </Button>
            </SectionRow>

            {organizations.length > 0 && activeOrganization && (
            <>
              <Divider css={{ margin: '0 -$4' }} />
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '24px',
              }}
              >
                <div>
                  <SectionTitle>Organisation</SectionTitle>
                  <ItemCard>
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <OrgDropdownTriggerBtn>
                          {activeOrganization.avatarUrl ? (
                            <Avatar src={activeOrganization.avatarUrl} style={{ width: 24, height: 24, borderRadius: '4px' }} alt="" />
                          ) : (
                            <AvatarFallback style={{
                              width: 24, height: 24, fontSize: '12px', borderRadius: '4px',
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
                    <Button variant="secondary" onClick={handleManageOrg}>Manage Org</Button>
                  </ItemCard>
                </div>

                <div>
                  <SectionTitle>Current plan</SectionTitle>
                  <ItemCard>
                    <FlexGrid>
                      <ItemCardColumn>
                        <ItemCardLabel>Plan</ItemCardLabel>
                        <ItemCardValue>{activeOrganization.subscription?.plan?.name || 'Starter'}</ItemCardValue>
                      </ItemCardColumn>
                      <ItemCardColumn>
                        <ItemCardLabel>Price</ItemCardLabel>
                        <ItemCardValue>{activeOrganization.subscription?.price || 'Free'}</ItemCardValue>
                      </ItemCardColumn>
                      <ItemCardColumn>
                        <ItemCardLabel>Billing date</ItemCardLabel>
                        <ItemCardValue>{activeOrganization.subscription?.billingDate || 'Endless'}</ItemCardValue>
                      </ItemCardColumn>
                    </FlexGrid>
                    <Button variant="secondary" onClick={handleManagePlan}>Manage Plan</Button>
                  </ItemCard>
                </div>
              </div>
            </>
            )}
          </CardSection>
        </Card>
      ) : (
        <Card>
          {/* If Not Authenticated, Show Login Component */}
          <CardSection>
            <OAuthLogin />
          </CardSection>

          <Divider css={{ margin: '0 -$4' }} />

          {/* License key section */}
          <CardSection>
            <div style={{ marginBottom: '8px' }}>
              <SectionTitle style={{ marginBottom: 0, fontSize: '12px' }}>License key</SectionTitle>
            </div>
            <SectionCaption style={{ marginBottom: '12px' }}>
              To activate plan go through registration process and then check your email or this link
              {' '}
              <InlineLink href="https://account.tokens.studio/email-login" target="_blank" rel="noreferrer">
                https://account.tokens.studio/email-login
              </InlineLink>
              {' '}
              to grab license key
            </SectionCaption>

            <InputRow>
              <TextInput
                css={{ flex: 1 }}
                name="license-key"
                placeholder="Enter license key"
                value={newKey}
                onChange={handleKeyChange}
                validationStatus={licenseKeyError ? 'error' : undefined}
              />
              {!existingKey ? (
                <Button
                  variant="secondary"
                  onClick={handleAddKey}
                  disabled={!newKey}
                >
                  Add license key
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleRemoveKey}>
                  Remove key
                </Button>
              )}
            </InputRow>
            {licenseKeyError && (
            <ErrorMessage>{licenseKeyError}</ErrorMessage>
            )}
          </CardSection>
        </Card>
      )}
    </ContentBox>
  );
}
