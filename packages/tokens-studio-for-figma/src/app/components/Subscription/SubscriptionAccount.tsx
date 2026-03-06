import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import { Button, TextInput } from '@tokens-studio/ui';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import { userIdSelector } from '@/selectors/userIdSelector';
import { Dispatch } from '@/app/store';
import { AddLicenseSource } from '@/app/store/models/userState';
import { addLicenseKey } from '@/utils/addLicenseKey';
import useConfirm from '@/app/hooks/useConfirm';
import { ErrorMessage } from '../ErrorMessage';

// ─── Styled ──────────────────────────────────────────────────────────

const ContentBox = styled('div', {
    padding: '$3',
    display: 'flex',
    flexDirection: 'column',
    gap: '$3',
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
    gap: '$3',
});

const CardDivider = styled('div', {
    height: '1px',
    background: '$borderSubtle',
});

const SectionRow = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '$3',
});

const SectionLabel = styled('span', {
    fontSize: '$small',
    fontWeight: '$sansBold',
    color: '$fgDefault',
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

const CopyIconButton = styled('button', {
    width: 28,
    height: 28,
    flexShrink: 0,
    border: '1px solid $borderMuted',
    borderRadius: '$medium',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '$fgMuted',
    '&:hover': { color: '$fgDefault' },
});

const InputRow = styled('div', {
    display: 'flex',
    gap: '$2',
    alignItems: 'flex-start',
});

// ─── Component ───────────────────────────────────────────────────────

export default function SubscriptionAccount() {
    const dispatch = useDispatch<Dispatch>();
    const existingKey = useSelector(licenseKeySelector);
    const licenseKeyError = useSelector(licenseKeyErrorSelector);
    const userId = useSelector(userIdSelector);
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

    const handleCopyKey = useCallback(() => {
        if (existingKey) {
            navigator.clipboard.writeText(existingKey);
        }
    }, [existingKey]);

    const handleLogIn = useCallback(() => {
        window.open('https://account.tokens.studio/email-login', '_blank');
    }, []);

    return (
        <ContentBox>
            <Card>
                {/* Log in row */}
                <CardSection>
                    <SectionRow>
                        <SectionLabel>Already have an account?</SectionLabel>
                        <Button variant="secondary" size="small" onClick={handleLogIn}>
                            Log In
                        </Button>
                    </SectionRow>
                </CardSection>

                <CardDivider />

                {/* License key section */}
                <CardSection>
                    <SectionRow>
                        <SectionLabel>License key</SectionLabel>
                        {existingKey && (
                            <CopyIconButton type="button" onClick={handleCopyKey} aria-label="Copy license key">
                                {/* Copy icon — two overlapping squares */}
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M9.5 4.5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5.5a1 1 0 0 0 1 1h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                            </CopyIconButton>
                        )}
                    </SectionRow>
                    <SectionCaption>
                        To activate plan go through registration process and then check your email or this link{' '}
                        <InlineLink href="https://account.tokens.studio/email-login" target="_blank" rel="noreferrer">
                            https://account.tokens.studio/email-login
                        </InlineLink>{' '}
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
        </ContentBox>
    );
}
