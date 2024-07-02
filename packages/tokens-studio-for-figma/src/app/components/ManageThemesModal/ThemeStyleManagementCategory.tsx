import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Heading, Checkbox } from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import Box from '../Box';
import Accordion from '../Accordion';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { isWaitingForBackgroundJobSelector } from '@/selectors';
import { RootState } from '@/app/store';
import { StyleInfo, ThemeStyleManagementCategoryStyleEntry } from './ThemeStyleManagementCategoryStyleEntry';
import Stack from '../Stack';
import { Count } from '../Count';
import Label from '../Label';

type Props = {
  label: string
  styles: Record<string, StyleInfo>
  icon?: React.ReactNode | null
  onAttachLocalStyles: () => void
  onDisconnectStyle: (name: string) => void
  onDisconnectSelectedStyle: (names: string[]) => void
};

export const ThemeStyleManagementCategory: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  label,
  icon,
  styles,
  onAttachLocalStyles,
  onDisconnectStyle,
  onDisconnectSelectedStyle,
}) => {
  const isAttachingLocalStyles = useSelector(useCallback((state: RootState) => (
    isWaitingForBackgroundJobSelector(state, BackgroundJobs.UI_ATTACHING_LOCAL_STYLES)
  ), []));
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const { t } = useTranslation(['tokens', 'errors']);

  const stylesEntries = useMemo(() => Object.entries(styles), [styles]);

  const handleSelectAll = React.useCallback(() => {
    setSelectedStyles(
      selectedStyles.length === stylesEntries.length
        ? []
        : stylesEntries.map(([token]) => token),
    );
  }, [selectedStyles, stylesEntries]);

  const handleDisconnectSelectedStyles = useCallback(() => {
    onDisconnectSelectedStyle(selectedStyles);
  }, [selectedStyles, onDisconnectSelectedStyle]);

  const handleToggleSelectedStyle = useCallback((token: string) => {
    setSelectedStyles(
      selectedStyles.includes(token)
        ? selectedStyles.filter((style) => style !== token)
        : [...selectedStyles, token],
    );
  }, [selectedStyles]);

  return (
    <Accordion
      data-testid={`themestylemanagementcategory-accordion-${label.toLowerCase()}`}
      disabled={stylesEntries.length === 0}
      label={(
        <Stack direction="row" gap={2} align="center">
          <Heading size="medium">
            {label}
          </Heading>
          {stylesEntries.length > 0 ? <Count count={stylesEntries.length} /> : null}
        </Stack>
      )}
      extra={(
        <Button
          size="small"
          disabled={isAttachingLocalStyles}
          onClick={onAttachLocalStyles}
        >
          {t('attachLocalStyles')}
        </Button>
      )}
      isOpenByDefault={false}
    >
      {
        stylesEntries.length > 0 && (
          <Stack
            align="center"
            justify="between"
            gap={3}
            css={{
              paddingInline: '$1', paddingTop: '$2',
            }}
          >
            <Stack
              align="center"
              gap={3}
              css={{ fontSize: '$small' }}
            >
              <Checkbox
                checked={selectedStyles.length === stylesEntries.length}
                id="detachSelected"
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="detachSelected" css={{ fontSize: '$small', fontWeight: '$sansBold' }}>
                {t('selectAll')}
              </Label>
            </Stack>
            <Stack gap={1}>
              <Button onClick={handleDisconnectSelectedStyles} disabled={selectedStyles.length === 0} variant="danger" size="small">
                {t('detachSelected')}
              </Button>
            </Stack>
          </Stack>
        )
      }
      <Box css={{
        display: 'grid', gap: '$2', gridTemplateColumns: 'minmax(0, 1fr)', padding: '$1',
      }}
      >
        {stylesEntries.map(([token, styleInfo]) => (
          <ThemeStyleManagementCategoryStyleEntry
            key={token}
            icon={icon}
            token={token}
            styleInfo={styleInfo}
            isChecked={selectedStyles.includes(token)}
            onDisconnectStyle={onDisconnectStyle}
            handleToggleSelectedStyle={handleToggleSelectedStyle}
          />
        ))}
      </Box>
    </Accordion>
  );
};
