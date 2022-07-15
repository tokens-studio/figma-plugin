import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IconArrowRight } from '@/icons';
import Box from '../Box';
import { Flex } from '../Flex';
import Accordion from '../Accordion';
import Heading from '../Heading';
import Text from '../Text';
import ResolvingLoader from '../ResolvingLoader';
import Button from '../Button';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { isWaitingForBackgroundJobSelector } from '@/selectors';
import { RootState } from '@/app/store';

export type StyleInfo = {
  id: string
  name?: string
  failedToResolve?: boolean
};

type Props = {
  label: string
  styles: Record<string, StyleInfo>
  icon?: React.ReactNode | null
  onAttachLocalStyles: () => void
};

export const ThemeStyleManagementCategory: React.FC<Props> = ({
  label,
  icon,
  styles,
  onAttachLocalStyles,
}) => {
  const isAttachingLocalStyles = useSelector(useCallback((state: RootState) => (
    isWaitingForBackgroundJobSelector(state, BackgroundJobs.UI_ATTACHING_LOCAL_STYLES)
  ), []));

  const stylesEntries = useMemo(() => Object.entries(styles), [styles]);

  return (
    <Accordion
      data-testid={`themestylemanagementcategory-accordion-${label.toLowerCase()}`}
      disabled={stylesEntries.length === 0}
      label={(
        <Heading size="medium">{label}</Heading>
      )}
      extra={(
        <Button
          variant="secondary"
          disabled={isAttachingLocalStyles}
          onClick={onAttachLocalStyles}
        >
          Attach local styles
        </Button>
      )}
      isOpenByDefault={false}
    >
      <Box css={{ display: 'grid', gap: '$2' }}>
        {stylesEntries.map(([token, styleInfo]) => (
          <Flex
            key={token}
            css={{
              gap: '$3',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            {icon && <Box>{icon}</Box>}
            <Flex
              css={{
                gap: '$3',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <Text size="small">{token}</Text>
              <IconArrowRight width="16" />
              {(!styleInfo.name && !styleInfo.failedToResolve) && (
                <ResolvingLoader />
              )}
              {(!styleInfo.name && styleInfo.failedToResolve) && (
                <Text bold size="small" css={{ color: '$fgDanger' }}>Failed to resolve</Text>
              )}
              {styleInfo.name && (
                <Text bold size="small">{styleInfo.name}</Text>
              )}
            </Flex>
          </Flex>
        ))}
      </Box>
    </Accordion>
  );
};
