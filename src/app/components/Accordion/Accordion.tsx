import React, {
  PropsWithChildren, ReactNode, useCallback, useState,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { StitchesCSS } from '@/types';
import { StyledContainer } from './StyledContainer';
import { StyledHeader } from './StyledHeader';
import { StyledContent } from './StyledContent';
import { StyledCollapseHandle } from './StyledCollapseHandle';
import { IconChevronDown } from '@/icons';
import IconButton from '../IconButton';
import Box from '../Box';

type Props = PropsWithChildren<{
  label: string
  extra?: ReactNode
  css?: StitchesCSS
  isOpenByDefault?: boolean
}>;

const MotionStyledContent = motion(StyledContent);

export function Accordion({
  css, label, extra, isOpenByDefault, children,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(isOpenByDefault ?? false);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <StyledContainer css={css}>
      <StyledCollapseHandle>
        <IconButton
          dataCy="accordion-toggle"
          css={{ marginTop: '$2', color: '$textMuted' }}
          icon={<IconChevronDown fill="currentColor" />}
          onClick={handleToggle}
        />
      </StyledCollapseHandle>
      <StyledHeader>
        <Box>{label}</Box>
        {extra}
      </StyledHeader>
      <AnimatePresence>
        {isOpen && (
          <MotionStyledContent
            key="content"
            data-testid="accordion-content"
            data-cy="accordion-content"
            transition={reducedMotion ? {
              duration: 0,
            } : undefined}
            initial={{ opacity: 0, height: 0 }}
            exit={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {children}
          </MotionStyledContent>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
}
