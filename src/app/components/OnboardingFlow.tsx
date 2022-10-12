import React from 'react';
import Heading from './Heading';
import Button from './Button';
import Modal from './Modal';
import Stack from './Stack';

export default function OnboardingFlow() {
  const changelog = [
    {
      image: {
        alt: '',
        filename: 'https://user-images.githubusercontent.com/4548309/190957841-bc189fb7-0351-4206-9e38-a4b85506d300.png',
      },
      title: 'Welcome to Figma Tokens',
      excerpt: 'Hey there, awesome to have you with us. Figma Tokens allows you to use design tokens in Figma and sync those to an external source of truth, for example GitHub.',
    },
    {
      image: {
        alt: '',
        filename: 'https://user-images.githubusercontent.com/4548309/190957812-4d0b9b79-49a6-49fa-a8e6-03f5c42bcb8f.png',
      },
      title: 'Create tokens',
      excerpt: 'Start by creating your tokens, a good place to start is your colors. You can even import your existing styles!',
      read_more_link: 'https://docs.figmatokens.com/tokens/creating-tokens',
    },
    {
      image: {
        alt: '',
        filename: 'https://user-images.githubusercontent.com/4548309/190957965-165ff18f-d5c4-4379-994f-12102025ff2f.png',
      },
      title: 'Reference token values',
      excerpt: 'Use your token values inside other tokens by writing them inside curly brackets: {global.colors.red.500} — that way you are able to reuse your tokens.',
      read_more_link: 'https://docs.figmatokens.com/tokens/aliases',
    },
    {
      image: {
        alt: '',
        filename: 'https://user-images.githubusercontent.com/4548309/190958036-e8261c6f-075c-47a0-b0df-afe06ac12109.png',
      },
      title: 'Apply tokens to a layer',
      excerpt: 'Select a layer in Figma and left-click any token to apply that token on it. Depending on the type of token you clicked on, a different action is performed. Right-click tokens for a context menu to choose what you want to apply.',
      read_more_link: 'https://docs.figmatokens.com/tokens/applying-tokens',
    },
    {
      image: {
        alt: '',
        filename: 'https://user-images.githubusercontent.com/4548309/190958143-f02a3368-ed29-4035-b251-9c6a4fafcea6.png',
      },
      title: 'Want to know more?',
      excerpt: 'Check out the Docs to find even more knowledge and guides. If there’s anything you’re struggling with, let us know!',
      read_more_link: 'https://docs.figmatokens.com',
    },
  ];

  const [onboardingFlowOpen, setOnboardingFlowOpen] = React.useState(true);
  const [activeIndex, setIndex] = React.useState(0);

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
    <Modal showClose isOpen={changelog.length > 0 && onboardingFlowOpen} close={handleClose}>
      <Stack direction="column" gap={4}>
        <Heading size="medium">Get Started</Heading>
        <div>
          {changelog.map((item, index) => (
            <Stack
              // eslint-disable-next-line no-underscore-dangle
              direction="column"
              gap={2}
              align="start"
              css={{ textAlign: 'left', display: index === activeIndex ? 'flex' : 'none' }}
            >
              {item.image && <img src={item.image.filename} alt={item.image.alt} className="mb-8 rounded" />}
              <Heading size="medium">{item.title}</Heading>
              <p className="text-xs">{item.excerpt}</p>
              {item.read_more_link && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={item.read_more_link}
                  className="inline-flex text-xs text-primary-500"
                >
                  Read more
                </a>
              )}
            </Stack>
          ))}
        </div>
        <Stack direction="row" gap={2} justify={activeIndex > 1 ? 'between' : 'end'}>
          {activeIndex > 1 && (
            <Button id="button-changelog-prev" onClick={handlePrev} variant="secondary">
              Previous
            </Button>
          )}
          {changelog.length > activeIndex + 1 ? (
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
