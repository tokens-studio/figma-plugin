/* eslint-disable global-require */
import React from 'react';
import { useSelector } from 'react-redux';
import Heading from './Heading';
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
  const onboardingflow = [
    {
      title: 'Welcome to Figma Tokens',
      excerpt: 'Hey there, awesome to have you with us. Figma Tokens allows you to use design tokens in Figma and sync those to an external source of truth, for example GitHub.',
    },
    {
      title: 'Create tokens',
      excerpt: 'Start by creating your tokens, a good place to start is your colors. You can even import your existing styles!',
      read_more_link: 'https://docs.figmatokens.com/tokens/creating-tokens',
    },
    {
      title: 'Reference token values',
      excerpt: 'Use your token values inside other tokens by writing them inside curly brackets: {colors.red.500} — that way you are able to reuse your tokens.',
      read_more_link: 'https://docs.figmatokens.com/tokens/aliases',
    },
    {
      title: 'Apply tokens to a layer',
      excerpt: 'Select a layer in Figma and left-click any token to apply that token on it. Depending on the type of token you clicked on, a different action is performed. Right-click tokens for a context menu to choose what you want to apply.',
      read_more_link: 'https://docs.figmatokens.com/tokens/applying-tokens',
    },
    {
      title: 'Want to know more?',
      excerpt: 'Check out the Docs to find even more knowledge and guides. If there’s anything you’re struggling with, let us know on Slack!',
      read_more_link: 'https://docs.figmatokens.com',
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
            <img src={fetchOnboardingImage(index)} alt="" className="rounded" />
            <Heading size="medium">{item.title}</Heading>
            <p className="text-xs">{item.excerpt}</p>
            {item.read_more_link && (
              <StyledLink
                target="_blank"
                rel="noreferrer"
                href={item.read_more_link}
              >
                Read more
              </StyledLink>
            )}
          </Stack>
        ))}
        <Stack direction="row" gap={2} justify={activeIndex > 1 ? 'between' : 'end'}>
          {activeIndex > 1 && (
            <Button id="button-changelog-prev" onClick={handlePrev} variant="secondary">
              Previous
            </Button>
          )}
          {onboardingflow.length > activeIndex + 1 ? (
            <Button id="button-changelog-next" variant="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button id="button-changelog-close" variant="primary" onClick={handleClose}>
              Close
            </Button>
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
