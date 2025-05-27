import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stack, Label, Box, Button, Switch, Text,
} from '@tokens-studio/ui';
import { styled } from '@stitches/react';
import {
  ChevronLeftIcon,
} from '@primer/octicons-react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../Modal/Modal';
import { LabelledCheckbox } from './LabelledCheckbox';
import { ExplainerModal } from '../ExplainerModal';
import {
  ignoreFirstPartForStylesSelector,
  prefixStylesWithThemeNameSelector,
  createStylesWithVariableReferencesSelector,
  removeStylesAndVariablesWithoutConnectionSelector,
  renameExistingStylesAndVariablesSelector,
  variablesColorSelector,
  variablesNumberSelector,
  variablesBooleanSelector,
  variablesStringSelector,
  stylesColorSelector,
  stylesEffectSelector,
  stylesTypographySelector,
} from '@/selectors';
import ignoreFirstPartImage from '@/app/assets/hints/ignoreFirstPartForStyles.png';
import prefixStylesImage from '@/app/assets/hints/prefixStyles.png';
import { Dispatch } from '../../store';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

const StyledCheckboxGrid = styled(Box, {
  display: 'grid', gridTemplateColumns: 'min-content 1fr', gridGap: '$3', alignItems: 'center',
});

// TODO: expose types from @tokens-studio/ui/checkbox
type CheckedState = boolean | 'indeterminate';

export default function OptionsModal({ isOpen, title, closeAction }: { isOpen: boolean, title: string, closeAction: () => void }) {
  const rulesRemoveStylesAndVariablesWithoutConnection = useSelector(removeStylesAndVariablesWithoutConnectionSelector);
  const rulesRenameExisting = useSelector(renameExistingStylesAndVariablesSelector);

  const rulesIgnoreFirstPartForStyles = useSelector(ignoreFirstPartForStylesSelector);
  const rulesPrefixStylesWithThemeName = useSelector(prefixStylesWithThemeNameSelector);
  const rulesCreateStylesWithVariableReferences = useSelector(createStylesWithVariableReferencesSelector);

  const variablesColor = useSelector(variablesColorSelector);
  const variablesNumber = useSelector(variablesNumberSelector);
  const variablesBoolean = useSelector(variablesBooleanSelector);
  const variablesString = useSelector(variablesStringSelector);
  const stylesColor = useSelector(stylesColorSelector);
  const stylesTypography = useSelector(stylesTypographySelector);
  const stylesEffect = useSelector(stylesEffectSelector);

  const dispatch = useDispatch<Dispatch>();
  
  // Save the current export settings to shared plugin data
  const saveVariableExportSettings = React.useCallback(() => {
    const settings = {
      ignoreFirstPartForStyles: rulesIgnoreFirstPartForStyles,
      prefixStylesWithThemeName: rulesPrefixStylesWithThemeName,
      createStylesWithVariableReferences: rulesCreateStylesWithVariableReferences,
      renameExistingStylesAndVariables: rulesRenameExisting,
      removeStylesAndVariablesWithoutConnection: rulesRemoveStylesAndVariablesWithoutConnection,
      variablesColor,
      variablesNumber,
      variablesBoolean,
      variablesString,
      stylesColor,
      stylesTypography,
      stylesEffect,
    };
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_VARIABLE_EXPORT_SETTINGS,
      settings: JSON.stringify(settings),
    });
  }, [
    rulesIgnoreFirstPartForStyles, rulesPrefixStylesWithThemeName, 
    rulesCreateStylesWithVariableReferences, rulesRenameExisting, 
    rulesRemoveStylesAndVariablesWithoutConnection, variablesColor, 
    variablesNumber, variablesBoolean, variablesString, 
    stylesColor, stylesTypography, stylesEffect
  ]);

  const handleIgnoreChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setIgnoreFirstPartForStyles(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );

  const handlePrefixWithThemeNameChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setPrefixStylesWithThemeName(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );

  const handleCreateStylesWithVariableReferencesChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setCreateStylesWithVariableReferences(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );

  const handleRenameExistingChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setRenameExistingStylesAndVariables(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );

  const handleRemoveStylesAndVariablesWithoutConnectionChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setRemoveStylesAndVariablesWithoutConnection(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );

  const handleExportVariablesColor = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setVariablesColor(!!state);
      // color can be created *either* styles or variables, we dont want both. if we're setting this to true, disable the other one
      if (state) dispatch.settings.setStylesColor(!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );

  const handleExportVariablesNumber = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setVariablesNumber(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );
  const handleExportVariablesBoolean = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setVariablesBoolean(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );
  const handleExportVariablesString = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setVariablesString(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );
  const handleExportStylesColor = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setStylesColor(!!state);
      // color can be created *either* styles or variables, we dont want both. if we're setting this to true, disable the other one
      if (state) dispatch.settings.setVariablesColor(!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );
  const handleExportStylesTypography = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setStylesTypography(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );
  const handleExportStylesEffect = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setStylesEffect(!!state);
      saveVariableExportSettings();
    },
    [dispatch.settings, saveVariableExportSettings],
  );

  const handleSaveOptions = React.useCallback(() => {
    saveVariableExportSettings();
    closeAction();
  }, [closeAction, saveVariableExportSettings]);

  const onInteractOutside = (event: Event) => {
    event.preventDefault();
  };

  const { t } = useTranslation(['manageStylesAndVariables', 'tokens']);

  return (
    <Modal
      size="fullscreen"
      title={title}
      backArrow
      isOpen={isOpen}
      close={closeAction}
      /* eslint-disable-next-line react/jsx-no-bind */
      onInteractOutside={(event) => onInteractOutside(event)}
      footer={(
        <Stack direction="row" justify="between" gap={4}>
          <Button variant="invisible" id="manageStyles-button-close" onClick={closeAction} icon={<ChevronLeftIcon />}>
            {t('actions.cancel')}
          </Button>

          <Button variant="primary" id="pullDialog-button-overwrite" onClick={handleSaveOptions}>
            {t('actions.confirm')}
          </Button>

        </Stack>
)}
      stickyFooter
    >
      <Stack direction="column" align="start" gap={4}>
        <Stack direction="column" align="start" gap={3}>
          <Text>{t('options.intro')}</Text>
          {/* Commenting out until we have docs <Link target="_blank" href="https://docs.tokens.studio/">{`${t('generic.learnMore')} – ${t('docs.exportToFigmaOptions')}`}</Link> */}
        </Stack>
        <form>
          <Stack direction="column" gap={6}>
            <Box>
              <Text bold css={{ fontSize: '$medium', marginBottom: '$2' }}>{t('options.createAndUpdate')}</Text>
              <Box css={{
                width: '100%', display: 'grid', gridTemplateColumns: '1fr 1px 1fr', columnGap: '$5',
              }}
              >
                <Stack direction="column" gap={3}>
                  <Text css={{ fontWeight: '$sansMedium' }}>{t('generic.variables')}</Text>
                  <LabelledCheckbox id="variablesColor" onChange={handleExportVariablesColor} checked={!!variablesColor} label={t('variables.color')} />
                  <LabelledCheckbox id="variablesString" onChange={handleExportVariablesString} checked={!!variablesString} label={t('variables.string')} />
                  <LabelledCheckbox id="variablesNumber" onChange={handleExportVariablesNumber} checked={!!variablesNumber} label={t('variables.number')} />
                  <LabelledCheckbox id="variablesBoolean" onChange={handleExportVariablesBoolean} checked={!!variablesBoolean} label={t('variables.boolean')} />
                </Stack>
                <Box css={{ alignSelf: 'stretch', width: '1px', border: '1px solid $colors$borderSubtle' }} />
                <Stack direction="column" gap={3}>
                  <Text css={{ fontWeight: '$sansMedium' }}>{t('generic.styles')}</Text>
                  <LabelledCheckbox id="styleColor" onChange={handleExportStylesColor} checked={!!stylesColor} label={t('styles.color')} />
                  <LabelledCheckbox id="stylesTypography" onChange={handleExportStylesTypography} checked={!!stylesTypography} label={t('styles.typography')} />
                  <LabelledCheckbox id="stylesEffect" onChange={handleExportStylesEffect} checked={!!stylesEffect} label={t('styles.effects')} />
                </Stack>
              </Box>
            </Box>
            <StyledCheckboxGrid>
              <Text bold css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 4 }}>{t('options.tokensExportedToFigmaShould')}</Text>
              <Switch
                data-testid="ignoreFirstPartForStyles"
                id="ignoreFirstPartForStyles"
                checked={!!rulesIgnoreFirstPartForStyles}
                defaultChecked={rulesIgnoreFirstPartForStyles}
                onCheckedChange={handleIgnoreChange}
              />
              <Label css={{ fontWeight: '$sansRegular', fontSize: '$xsmall' }} htmlFor="ignoreFirstPartForStyles">{t('options.ignorePrefix')}</Label>
              <ExplainerModal title={t('options.ignorePrefix')}>
                <Box as="img" src={ignoreFirstPartImage} css={{ borderRadius: '$small' }} />
                <Box>{t('options.ignorePrefixExplanation')}</Box>
              </ExplainerModal>

              <Switch
                data-testid="prefixStylesWithThemeName"
                id="prefixStylesWithThemeName"
                checked={!!rulesPrefixStylesWithThemeName}
                defaultChecked={rulesPrefixStylesWithThemeName}
                onCheckedChange={handlePrefixWithThemeNameChange}
              />
              <Label css={{ fontWeight: '$sansRegular', fontSize: '$xsmall' }} htmlFor="prefixStylesWithThemeName">{t('options.prefixStyles')}</Label>
              <ExplainerModal title={t('options.prefixStyles')}>
                <Box as="img" src={prefixStylesImage} css={{ borderRadius: '$small' }} />
                <Box>{t('options.prefixStylesExplanation')}</Box>
              </ExplainerModal>

              <Switch
                data-testid="createStylesWithVariableReferences"
                id="createStylesWithVariableReferences"
                checked={!!rulesCreateStylesWithVariableReferences}
                defaultChecked={rulesCreateStylesWithVariableReferences}
                onCheckedChange={handleCreateStylesWithVariableReferencesChange}
              />
              <Label css={{ fontWeight: '$sansRegular', fontSize: '$xsmall' }} htmlFor="createStylesWithVariableReferences">{t('options.createStylesWithVariableReferences')}</Label>
              <ExplainerModal title={t('options.createStylesWithVariableReferences')}>
                <Box>{t('options.createStylesWithVariableReferencesExplanation')}</Box>
              </ExplainerModal>
              <Switch
                data-testid="renameExisting"
                id="renameExisting"
                checked={!!rulesRenameExisting}
                defaultChecked={rulesRenameExisting}
                onCheckedChange={handleRenameExistingChange}
              />
              <Label css={{ fontWeight: '$sansRegular', fontSize: '$xsmall' }} htmlFor="renameExisting">{t('options.renameExisting')}</Label>
              <ExplainerModal title={t('options.renameExisting')}>
                <Box>{t('options.renameExistingExplanation')}</Box>
              </ExplainerModal>
              <Switch
                data-testid="removeWithoutConnection"
                id="removeWithoutConnection"
                checked={!!rulesRemoveStylesAndVariablesWithoutConnection}
                defaultChecked={rulesRemoveStylesAndVariablesWithoutConnection}
                onCheckedChange={handleRemoveStylesAndVariablesWithoutConnectionChange}
              />
              <Label css={{ fontWeight: '$sansRegular', fontSize: '$xsmall' }} htmlFor="removeWithoutConnection">{t('options.removeWithoutConnection')}</Label>
              <ExplainerModal title={t('options.removeWithoutConnection')}>
                <Box>{t('options.removeWithoutConnectionExplanation')}</Box>
              </ExplainerModal>
            </StyledCheckboxGrid>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
}
