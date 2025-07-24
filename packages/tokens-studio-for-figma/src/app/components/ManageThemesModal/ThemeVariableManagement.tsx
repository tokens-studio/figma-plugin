import React, {
  useCallback, useMemo, useState, useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Sentry from '@sentry/react';
import { Button, Heading, Checkbox } from '@tokens-studio/ui';
import Box from '../Box';
import Accordion from '../Accordion';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { isWaitingForBackgroundJobSelector, themeByIdSelector, tokensSelector } from '@/selectors';
import { Dispatch, RootState } from '@/app/store';
import Stack from '../Stack';
import { Count } from '../Count';
import Label from '../Label';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { track } from '@/utils/analytics';
import { ThemeVariableManagementEntry, VariableInfo } from './ThemeVariableManagementEntry';
import mapThemeToVariableInfo from '@/utils/mapThemeToVariableInfo';
import { wrapTransaction } from '@/profiling/transaction';

type Props = {
  id: string
};

export const ThemeVariableManagement: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ id }) => {
  const theme = useSelector(useCallback((state: RootState) => (
    themeByIdSelector(state, id)
  ), [id]));
  const tokens = useSelector(tokensSelector);
  const isAttachingLocalVariables = useSelector(useCallback((state: RootState) => (
    isWaitingForBackgroundJobSelector(state, BackgroundJobs.UI_ATTACHING_LOCAL_VARIABLES)
  ), []));
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [resolvedVariableInfo, setResolvedVariableInfo] = useState<Record<string, VariableInfo>>(mapThemeToVariableInfo(theme));
  const dispatch = useDispatch<Dispatch>();
  const variableEntries = useMemo(() => Object.entries(resolvedVariableInfo), [resolvedVariableInfo]);

  useEffect(() => {
    const allVariableIds = Object.values(theme?.$figmaVariableReferences ?? {}).map((variableId) => variableId);
    if (allVariableIds.length > 0) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.RESOLVE_VARIABLE_INFO,
        variableIds: allVariableIds,
      }).then(({ resolvedValues }) => {
        const nextResolvedVariableInfo = Object.fromEntries(Object.entries(theme?.$figmaVariableReferences ?? {}).map(([tokenName, variableId]) => [tokenName, {
          id: variableId,
          name: resolvedValues[variableId]?.name,
          isResolved: !!resolvedValues[variableId]?.key,
        }]));
        setResolvedVariableInfo(nextResolvedVariableInfo);
      }).catch((err) => {
        console.error(err);
        Sentry.captureException(err);
      });
    } else {
      setResolvedVariableInfo({});
    }
  }, [theme]);

  const handleSelectAll = React.useCallback(() => {
    setSelectedVariables(
      selectedVariables.length === variableEntries.length
        ? []
        : variableEntries.map(([token]) => token),
    );
  }, [selectedVariables, variableEntries]);

  const handleDisconnectSelectedVariables = useCallback(() => {
    if (theme) {
      track('Disconnect selected variables', { selectedVariables });
      dispatch.tokenState.disconnectVariableFromTheme({
        id: theme.id,
        key: selectedVariables,
      });
    }
  }, [theme, dispatch.tokenState, selectedVariables]);

  const handleToggleSelectedVariable = useCallback((token: string) => {
    setSelectedVariables(
      selectedVariables.includes(token)
        ? selectedVariables.filter((style) => style !== token)
        : [...selectedVariables, token],
    );
  }, [selectedVariables]);

  const handleDisconnectVariable = useCallback((token: string) => {
    if (theme) {
      track('Disconnect variable', { token });
      dispatch.tokenState.disconnectVariableFromTheme({
        id: theme.id,
        key: token,
      });
    }
  }, [theme, dispatch.tokenState]);

  const handleAttachLocalVariables = useCallback(async () => {
    if (theme) {
      dispatch.uiState.startJob({
        name: BackgroundJobs.UI_ATTACHING_LOCAL_VARIABLES,
        isInfinite: true,
      });
      const result = await wrapTransaction({ name: 'attachVariables' }, async () => await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.ATTACH_LOCAL_VARIABLES_TO_THEME,
        tokens,
        theme,
      }));
      if (result.variableInfo) {
        track('Attach variables to theme', {
          count: Object.values(result.variableInfo.variableIds).length,
        });
        dispatch.tokenState.assignVariableIdsToTheme({
          [id]: result.variableInfo,
        });
      }
      dispatch.uiState.completeJob(BackgroundJobs.UI_ATTACHING_LOCAL_VARIABLES);
    }
  }, [theme, tokens, id, dispatch]);

  return (
    <Accordion
      data-testid="themevariablemanagement-accordion"
      disabled={variableEntries.length === 0}
      label={(
        <Stack direction="row" gap={2} align="center">
          <Heading size="medium">
            Variables
          </Heading>
          {variableEntries.length > 0 ? <Count count={variableEntries.length} /> : null}
        </Stack>
      )}
      extra={(
        <Button
          size="small"
          disabled={isAttachingLocalVariables}
          onClick={handleAttachLocalVariables}
        >
          Attach local variables
        </Button>
      )}
      isOpenByDefault={false}
    >
      {
        variableEntries.length > 0 && (
          <Box css={{
            display: 'flex', alignItems: 'center', gap: '$3', justifyContent: 'space-between', paddingInline: '$1', paddingTop: '$2',
          }}
          >
            <Box css={{
              display: 'flex', alignItems: 'center', gap: '$3', fontSize: '$small',
            }}
            >
              <Checkbox
                checked={selectedVariables.length === variableEntries.length}
                id="detachSelected"
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="detachSelected" css={{ fontSize: '$small', fontWeight: '$sansBold' }}>
                Select all
              </Label>
            </Box>
            <Box css={{ display: 'flex', flexDirection: 'row', gap: '$1' }}>
              <Button onClick={handleDisconnectSelectedVariables} disabled={selectedVariables.length === 0} variant="danger" size="small">
                Detach selected
              </Button>
            </Box>
          </Box>
        )
      }
      <Box css={{
        display: 'grid', gap: '$2', gridTemplateColumns: 'minmax(0, 1fr)', padding: '$1',
      }}
      >
        {variableEntries.map(([token, variableInfo]) => (
          <ThemeVariableManagementEntry
            key={token}
            token={token}
            variableInfo={variableInfo}
            isChecked={selectedVariables.includes(token)}
            onDisconnectVariable={handleDisconnectVariable}
            handleToggleSelectedVariable={handleToggleSelectedVariable}
          />
        ))}
      </Box>
    </Accordion>
  );
};
