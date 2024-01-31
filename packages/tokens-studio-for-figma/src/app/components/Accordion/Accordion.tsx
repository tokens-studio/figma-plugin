import React, {
  PropsWithChildren, ReactNode, useCallback, useState,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Box, IconButton, Stack } from '@tokens-studio/ui';
import type { StitchesCSS } from '@/types';
import { StyledContainer } from './StyledContainer';
import { IconChevronDown, IconChevronRight } from '@/icons';
import { Flex } from '../Flex';

type Props = PropsWithChildren<{
  label: ReactNode
  extra?: ReactNode
  css?: StitchesCSS
  disabled?: boolean
  isOpenByDefault?: boolean
  height?: string | number
}>;

export function Accordion({
  css, label, extra, disabled, isOpenByDefault, height, children,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(isOpenByDefault ?? false);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <StyledContainer css={css}>
      <Box css={{
        gridColumn: '1',
        gridRow: '1',
      }}
      >
        <IconButton
          data-testid="accordion-toggle"
          size="small"
          variant="invisible"
          icon={isOpen ? <IconChevronDown /> : <IconChevronRight />}
          disabled={disabled}
          onClick={handleToggle}
        />
      </Box>
      <Stack css={{
        gridRow: '1',
        gridColumn: '2',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '100%',
      }}
      >
        <Box>{label}</Box>
        <Flex css={{ height: 0, alignItems: 'center' }}>
          {extra}
        </Flex>
      </Stack>
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
            transition={reducedMotion ? {
              duration: 0,
            } : undefined}
            initial={{ opacity: 0, height: 0 }}
            exit={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <Box css={{ paddingTop: '$4', maxHeight: height || 'inherit', overflowY: 'scroll' }}>
              {children}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
}
