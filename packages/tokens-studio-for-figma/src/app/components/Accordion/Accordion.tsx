import React, {
  PropsWithChildren, ReactNode, useCallback, useState,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { StitchesCSS } from '@/types';
import { StyledContainer } from './StyledContainer';
import { StyledHeader } from './StyledHeader';
import { StyledCollapseHandle } from './StyledCollapseHandle';
import { IconChevronDown } from '@/icons';
import Box from '../Box';
import { Flex } from '../Flex';
import { StyledIconButton } from './StyledIconButton';

type Props = PropsWithChildren<{
  label: ReactNode
  extra?: ReactNode
  css?: StitchesCSS
  disabled?: boolean
  isOpenByDefault?: boolean
}>;

export function Accordion({
  css, label, extra, disabled, isOpenByDefault, children,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(isOpenByDefault ?? false);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <StyledContainer css={css}>
      <StyledCollapseHandle>
        <StyledIconButton
          open={isOpen}
          dataCy="accordion-toggle"
          icon={<IconChevronDown width={6} height={6} fill="currentColor" />}
          disabled={disabled}
          onClick={handleToggle}
        />
      </StyledCollapseHandle>
      <StyledHeader>
        <Box>{label}</Box>
        <Flex css={{ height: 0, alignItems: 'center' }}>
          {extra}
        </Flex>
      </StyledHeader>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            style={{
              overflow: 'hidden',
              gridColumn: '2',
              gridRow: '2',
            }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
}
