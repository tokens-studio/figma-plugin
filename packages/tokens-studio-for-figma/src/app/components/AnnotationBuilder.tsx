import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@tokens-studio/ui';
import { uiStateSelector } from '@/selectors';
import createAnnotation from './createAnnotation';
import Stack from './Stack';
import Text from './Text';
import Box from './Box';
import { isEqual } from '@/utils/isEqual';
import { Direction } from '@/constants/Direction';

export default function AnnotationBuilder() {
  const { t } = useTranslation(['inspect']);
  const uiState = useSelector(uiStateSelector, isEqual);

  const createAnnotationLeft = React.useCallback(() => {
    createAnnotation(uiState.mainNodeSelectionValues, Direction.LEFT);
  }, [uiState]);

  const createAnnotationTop = React.useCallback(() => {
    createAnnotation(uiState.mainNodeSelectionValues, Direction.TOP);
  }, [uiState]);

  const createAnnotationBottom = React.useCallback(() => {
    createAnnotation(uiState.mainNodeSelectionValues, Direction.BOTTOM);
  }, [uiState]);

  const createAnnotationRight = React.useCallback(() => {
    createAnnotation(uiState.mainNodeSelectionValues, Direction.RIGHT);
  }, [uiState]);

  return Object.entries(uiState.mainNodeSelectionValues).length > 0 ? (
    <Box css={{ borderBottom: '1px solid $borderMuted', paddingBottom: '$4', marginBottom: '$4' }}>
      <Stack direction="row" align="center" justify="between">
        <Text bold>{t('addAnnotation')}</Text>
        <Stack direction="row" align="center" gap={2}>
          <IconButton onClick={createAnnotationLeft} icon="←" />
          <Stack direction="column" gap={2}>
            <IconButton onClick={createAnnotationTop} icon="↑" />
            <IconButton onClick={createAnnotationBottom} icon="↓" />
          </Stack>
          <IconButton onClick={createAnnotationRight} icon="→" />
        </Stack>
      </Stack>
    </Box>
  ) : null;
}
