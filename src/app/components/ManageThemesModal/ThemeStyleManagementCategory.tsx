import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Box from '../Box';
import Accordion from '../Accordion';
import Heading from '../Heading';
import Button from '../Button';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { isWaitingForBackgroundJobSelector } from '@/selectors';
import { RootState } from '@/app/store';
import { StyleInfo, ThemeStyleManagementCategoryStyleEntry } from './ThemeStyleManagementCategoryStyleEntry';

type Props = {
  label: string
  styles: Record<string, StyleInfo>
  icon?: React.ReactNode | null
  onAttachLocalStyles: () => void
  onDisconnectStyle: (name: string) => void
};

export const ThemeStyleManagementCategory: React.FC<Props> = ({
  label,
  icon,
  styles,
  onAttachLocalStyles,
  onDisconnectStyle,
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
      <Box css={{ display: 'grid', gap: '$2', gridTemplateColumns: 'minmax(0, 1fr)' }}>
        {stylesEntries.map(([token, styleInfo]) => (
          <ThemeStyleManagementCategoryStyleEntry
            key={token}
            icon={icon}
            token={token}
            styleInfo={styleInfo}
            onDisconnectStyle={onDisconnectStyle}
          />
        ))}
      </Box>
    </Accordion>
  );
};
