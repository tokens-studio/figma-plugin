import React from 'react';
import { useSelector } from 'react-redux';
import Heading from './Heading';
import Button from './Button';
import Modal from './Modal';
import { changelogSelector } from '@/selectors';
import Stack from './Stack';
import { styled } from '@/stitches.config';

const StyledReadMoreLink = styled('a', {
  color: '$fgAccent',
  fontSize: '$xsmall',
});

export default function Changelog() {
  const [changelogOpen, setChangelogOpen] = React.useState(true);
  const changelog = useSelector(changelogSelector);

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
    <Modal title="Changelog" showClose isOpen={changelog.length > 0 && changelogOpen} close={handleClose}>
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
              {item.image && <img src={item.image.filename} alt={item.image.alt} className="mb-8 rounded" />}
              <Heading>{item.title}</Heading>
              <p className="text-xs">{item.excerpt}</p>
              {item.read_more_link && (
                <StyledReadMoreLink
                  target="_blank"
                  rel="noreferrer"
                  href={item.read_more_link}
                >
                  {item.read_more_text ? item.read_more_text : 'Read more'}
                </StyledReadMoreLink>
              )}
            </Stack>
          ))}
        </div>
        <Stack direction="row" gap={2} justify="between">
          <Button id="button-changelog-close" onClick={handleClose} variant="secondary">
            Close
          </Button>
          <Stack direction="row" justify="between" gap={2}>
            {activeIndex !== 0 && (
              <Button id="button-changelog-prev" onClick={handlePrev} variant="secondary">
                Previous
              </Button>
            )}
            {changelog.length > activeIndex + 1 && (
              <Button id="button-changelog-next" variant="primary" onClick={handleNext}>
                Next
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
}
