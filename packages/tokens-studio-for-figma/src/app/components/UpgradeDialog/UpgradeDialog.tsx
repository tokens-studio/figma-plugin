import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Heading, Stack, Text,
} from '@tokens-studio/ui';
import Modal from '../Modal';
import UpgradeDialogMedia from './UpgradeDialogMedia';
import {
  getTrialUrl, includedFeatureKeys, upgradeFeatureSlides, UpgradeFeature, UpgradeSlide,
} from './upgradeFeatures';
import { useUpgradeDialogStore } from '@/app/store/useUpgradeDialogStore';
import { track } from '@/utils/analytics';

const unlockSlide: UpgradeSlide = { media: 'plus', headingKey: 'unlock.heading', bodyKey: 'unlock.body' };

function UpgradeDialogContent({ feature, source, onClose }: { feature: UpgradeFeature; source: string | null; onClose: () => void }) {
  const { t } = useTranslation(['upgrade']);
  const [step, setStep] = React.useState(0);

  const slides = useMemo(() => [...upgradeFeatureSlides[feature], unlockSlide], [feature]);
  const slide = slides[step];
  const isLastStep = step === slides.length - 1;
  const title = t(`features.${feature}.title`);

  useEffect(() => {
    track('Upgrade Dialog Opened', { feature, source });
  }, [feature, source]);

  const handlePrevious = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const handleNext = useCallback(() => setStep((s) => Math.min(slides.length - 1, s + 1)), [slides.length]);

  const handleStartTrial = useCallback(() => {
    track('Upgrade Dialog Trial Clicked', { feature, source });
    window.open(getTrialUrl(feature), '_blank');
    onClose();
  }, [feature, source, onClose]);

  const includedFeatures = includedFeatureKeys
    .filter((key) => key !== feature)
    .map((key) => t(`includedFeatures.${key}`))
    .join(', ');

  const footer = (
    <Stack direction="row" justify="between" align="center">
      <Text muted size="small" data-testid="upgrade-dialog-step">
        {t('stepOf', { current: step + 1, total: slides.length })}
      </Text>
      <Stack direction="row" gap={3}>
        {step > 0 && (
          <Button variant="secondary" onClick={handlePrevious}>
            {t('previous')}
          </Button>
        )}
        {isLastStep ? (
          <Button variant="primary" onClick={handleStartTrial} data-testid="upgrade-dialog-start-trial">
            {t('startFreeTrial')}
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext} data-testid="upgrade-dialog-next">
            {t('next')}
          </Button>
        )}
      </Stack>
    </Stack>
  );

  return (
    <Modal id="upgrade-dialog" title={title} isOpen close={onClose} size="large" showClose footer={footer}>
      <Stack direction="column" gap={4}>
        <UpgradeDialogMedia media={slide.media} title={title} step={step} total={slides.length} />
        <Heading size="medium">{t(slide.headingKey)}</Heading>
        {isLastStep ? (
          <Stack direction="column" gap={4}>
            <Text>{t('unlock.body', { feature: title })}</Text>
            <Text>
              {t('unlock.alsoIncluded')}
              <br />
              {t('unlock.alsoIncludedList', { features: includedFeatures })}
            </Text>
            <Text>{t('unlock.closing')}</Text>
          </Stack>
        ) : (
          <Text>{t(slide.bodyKey)}</Text>
        )}
      </Stack>
    </Modal>
  );
}

export default function UpgradeDialog() {
  const { feature, source, closeUpgradeDialog } = useUpgradeDialogStore();
  if (!feature) return null;
  // Keyed so reopening (or switching feature) always starts from the first slide.
  return <UpgradeDialogContent key={feature} feature={feature} source={source} onClose={closeUpgradeDialog} />;
}
