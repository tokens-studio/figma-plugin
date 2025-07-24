import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Heading } from '@tokens-studio/ui';
import Text from './Text';
import Modal from './Modal';
import { changelogSelector } from '@/selectors';
import Stack from './Stack';
import { styled } from '@/stitches.config';

const StyledReadMoreLink = styled('a', {
  color: '$accentDefault',
  fontSize: '$xsmall',
});

const StyledImage = styled('img', {
  marginBottom: '$4',
  borderRadius: '$medium',
});

export default function Changelog() {
  const [changelogOpen, setChangelogOpen] = React.useState(true);
  const changelog = useSelector(changelogSelector);
  const { t } = useTranslation(['general']);

  const [activeIndex, setIndex] = React.useState(0);

  const handleNext = React.useCallback(() => {
    setIndex(activeIndex + 1);
  }, [activeIndex]);

  const handlePrev = React.useCallback(() => {
    setIndex(activeIndex - 1);
  }, [activeIndex]);

  const handleClose = React.useCallback(() => {
    setChangelogOpen(false);
  }, []);

  return (
    <Modal title={t('changelog')} showClose isOpen={changelog.length > 0 && changelogOpen} close={handleClose}>
      <Stack direction="column" gap={4}>
        <div>
          {changelog.map((item, index) => (
            <Stack
              // eslint-disable-next-line no-underscore-dangle
              key={item._uid}
              direction="column"
              gap={2}
              align="start"
              css={{ display: index === activeIndex ? 'flex' : 'none' }}
            >
              {item.image && <StyledImage src={item.image.filename} alt={item.image.alt} />}
              <Heading>{item.title}</Heading>
              <Text size="small">{item.excerpt}</Text>
              {item.read_more_link && (
                <StyledReadMoreLink
                  target="_blank"
                  rel="noreferrer"
                  href={item.read_more_link}
                >
                  {item.read_more_text ? item.read_more_text : t('readMore')}
                </StyledReadMoreLink>
              )}
            </Stack>
          ))}
        </div>
        <Stack direction="row" gap={2} justify="between">
          <Button data-testid="button-changelog-close" onClick={handleClose} variant="secondary">
            {t('close')}
          </Button>
          <Stack direction="row" justify="between" gap={2}>
            {activeIndex !== 0 && (
              <Button data-testid="button-changelog-prev" onClick={handlePrev} variant="secondary">
                {t('previous')}
              </Button>
            )}
            {changelog.length > activeIndex + 1 && (
              <Button data-testid="button-changelog-next" variant="primary" onClick={handleNext}>
                {t('next')}
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
}
