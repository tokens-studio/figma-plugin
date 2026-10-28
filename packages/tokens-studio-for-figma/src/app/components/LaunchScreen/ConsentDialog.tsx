import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Checkbox, Label, Stack,
} from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { Modal } from '../Modal/Modal';

const TERMS_URL = 'https://production.tokens.studio/legal/terms-of-service';
const PRIVACY_URL = 'https://production.tokens.studio/legal/privacy-policy';

const Description = styled('p', {
  fontSize: '$xsmall',
  lineHeight: 1.46,
});

const ConsentLabel = styled(Label, {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$1',
  fontSize: '$xsmall',
  '& a': {
    color: 'inherit',
    textDecoration: 'underline',
  },
});

const Required = styled('span', {
  color: '$dangerFg',
});

export type ConsentChoices = {
  performanceAnalytics: boolean
};

type Props = {
  isOpen: boolean
  onAgree?: (choices: ConsentChoices) => void
  onCancel?: () => void
};

export default function ConsentDialog({ isOpen, onAgree, onCancel }: Props) {
  const { t } = useTranslation(['startScreen']);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [performanceAnalytics, setPerformanceAnalytics] = useState(false);

  const handleTermsChange = useCallback((checked: boolean | 'indeterminate') => {
    setTermsAccepted(checked === true);
  }, []);

  const handleAnalyticsChange = useCallback((checked: boolean | 'indeterminate') => {
    setPerformanceAnalytics(checked === true);
  }, []);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  // Cancel signs the user out, so a stray click outside the dialog shouldn't trigger it.
  const preventOutsideClose = useCallback((event: Event) => {
    event.preventDefault();
  }, []);

  const handleAgree = useCallback(() => {
    onAgree?.({ performanceAnalytics });
  }, [onAgree, performanceAnalytics]);

  return (
    <Modal
      title={t('termsAndConditions')}
      isOpen={isOpen}
      close={handleCancel}
      showClose
      onInteractOutside={preventOutsideClose}
      footer={(
        <Stack direction="row" gap={3} justify="end">
          <Button variant="secondary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleAgree} disabled={!termsAccepted} data-testid="consent-agree">
            {t('agreeAndContinue')}
          </Button>
        </Stack>
      )}
    >
      <Stack direction="column" gap={4} align="start">
        <Description>{t('consentDescription')}</Description>
        <Stack direction="row" gap={3} align="center">
          <Checkbox
            id="consent-terms"
            checked={termsAccepted}
            onCheckedChange={handleTermsChange}
            data-testid="consent-terms"
          />
          <ConsentLabel htmlFor="consent-terms">
            <a href={TERMS_URL} target="_blank" rel="noreferrer">{t('termsOfService')}</a>
            <Required aria-hidden>*</Required>
          </ConsentLabel>
        </Stack>
        <Stack direction="row" gap={3} align="center">
          <Checkbox
            id="consent-analytics"
            checked={performanceAnalytics}
            onCheckedChange={handleAnalyticsChange}
            data-testid="consent-analytics"
          />
          <ConsentLabel htmlFor="consent-analytics">
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer">{t('performanceAnalytics')}</a>
            {t('optional')}
          </ConsentLabel>
        </Stack>
      </Stack>
    </Modal>
  );
}
