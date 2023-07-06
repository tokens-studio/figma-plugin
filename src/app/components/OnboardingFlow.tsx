/* eslint-disable global-require */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Heading from './Heading';
import Text from './Text';
import Button from './Button';
import Modal from './Modal';
import { getLastopened } from '@/selectors';
import Stack from './Stack';
import { styled } from '@/stitches.config';

const StyledLink = styled('a', {
  display: 'inline-flex',
  fontSize: '$1',
  color: '$fgAccent',
});

const StyledImage = styled('img', {
  borderRadius: '$card',
});

function fetchOnboardingImage(idx: number) {
  switch (idx) {
    case 0:
      return require('../assets/onboardingflow/0.webp');
    case 1:
      return require('../assets/onboardingflow/1.webp');
    case 2:
      return require('../assets/onboardingflow/2.webp');
    case 3:
      return require('../assets/onboardingflow/3.webp');
    case 4:
      return require('../assets/onboardingflow/4.webp');
    default:
      return '';
  }
}

export default function OnboardingFlow() {
  const { t } = useTranslation(['onboarding']);
  const onboardingflow = [
    {
      title: t('welcome'),
      excerpt: t('welcomeText'),
    },
    {
      title: t('createTokens'),
      excerpt: t('createTokensText'),
      read_more_link: 'https://docs.tokens.studio/tokens/creating-tokens',
    },
    {
      title: t('reference'),
      excerpt: t('referenceText'),
      read_more_link: 'https://docs.tokens.studio/tokens/aliases',
    },
    {
      title: t('apply'),
      excerpt: t('applyText'),
      read_more_link: 'https://docs.tokens.studio/tokens/applying-tokens',
    },
    {
      title: t('knowMore'),
      excerpt: t('knowMoreText'),
      read_more_link: 'https://docs.tokens.studio',
    },
  ];

  const [onboardingFlowOpen, setOnboardingFlowOpen] = React.useState(true);
  const [activeIndex, setIndex] = React.useState(0);

  const lastOpened = useSelector(getLastopened);

  const handleNext = React.useCallback(() => {
    setIndex(activeIndex + 1);
  }, [activeIndex]);

  const handlePrev = React.useCallback(() => {
    setIndex(activeIndex - 1);
  }, [activeIndex]);

  const handleClose = React.useCallback(() => {
    setOnboardingFlowOpen(false);
  }, []);

  return (
    <Modal showClose isOpen={lastOpened === 0 && onboardingFlowOpen} close={handleClose}>
      <Stack direction="column" gap={4}>
        {onboardingflow.map((item, index) => (
          <Stack
            // eslint-disable-next-line react/no-array-index-key
            key={`onboarding-${index}`}
            direction="column"
            gap={3}
            align="start"
            css={{ textAlign: 'left', display: index === activeIndex ? 'flex' : 'none' }}
          >
            <StyledImage src={fetchOnboardingImage(index)} alt="" />
            <Heading size="medium">{item.title}</Heading>
            <Text size="small">{item.excerpt}</Text>
            {item.read_more_link && (
              <StyledLink
                target="_blank"
                rel="noreferrer"
                href={item.read_more_link}
              >
                {t('readMore')}
              </StyledLink>
            )}
          </Stack>
        ))}
        <Stack direction="row" gap={2} justify={activeIndex > 1 ? 'between' : 'end'}>
          {activeIndex > 1 && (
            <Button id="button-changelog-prev" onClick={handlePrev} variant="secondary">
              {t('previous')}
            </Button>
          )}
          {onboardingflow.length > activeIndex + 1 ? (
            <Button id="button-changelog-next" variant="primary" onClick={handleNext}>
              {t('next')}
            </Button>
          ) : (
            <Button id="button-changelog-close" variant="primary" onClick={handleClose}>
              {t('close')}
            </Button>
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
