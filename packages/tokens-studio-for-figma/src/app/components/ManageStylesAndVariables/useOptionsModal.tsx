import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stack, Label, Box, Heading, Link, Button, Switch, Text,
} from '@tokens-studio/ui';
import {
  ChevronLeftIcon, SlidersIcon,
} from '@primer/octicons-react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@stitches/react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Modal } from '../Modal/Modal';
import { LabelledCheckbox } from './LabelledCheckbox';
import { ExplainerModal } from '../ExplainerModal';
import {
  ignoreFirstPartForStylesSelector,
  overwriteExistingStylesAndVariablesSelector,
  scopeVariablesByTokenTypeSelector,
  prefixStylesWithThemeNameSelector,
} from '@/selectors';
import ignoreFirstPartImage from '@/app/assets/hints/ignoreFirstPartForStyles.png';
import prefixStylesImage from '@/app/assets/hints/prefixStyles.png';
import { Dispatch } from '../../store';

const StyledCheckboxGrid = styled(Box, {
  display: 'grid', gridTemplateColumns: 'min-content 1fr', gridGap: '$3', alignItems: 'center',
});

type ExportOptions = {
  variablesColor: boolean,
  variablesString: boolean,
  variablesNumber: boolean,
  variablesBoolean: boolean,
  stylesColor: boolean,
  stylesTypography: boolean,
  stylesEffect: boolean,
  rulesOverwriteExisting: boolean,
  rulesScopeByType: boolean,
  rulesIgnoreFirstPart: boolean,
  rulesPrefixStylesWithThemeName: boolean,
};

export default function useOptionsModal() {
  const overwriteExistingStylesAndVariables = useSelector(overwriteExistingStylesAndVariablesSelector);
  const scopeVariablesByTokenType = useSelector(scopeVariablesByTokenTypeSelector);
  const ignoreFirstPartForStyles = useSelector(ignoreFirstPartForStylesSelector);
  const prefixStylesWithThemeName = useSelector(prefixStylesWithThemeNameSelector);

  // TODO: This is the state that needs to be saved, it should be stored on the document.
  // If a user cancels this dialog, the state should be reverted to the last saved state.
  const [exportOptions, setExportOptions] = React.useState<ExportOptions>({
    variablesColor: true,
    variablesString: true,
    variablesNumber: true,
    variablesBoolean: true,
    stylesColor: true,
    stylesTypography: true,
    stylesEffect: true,
    rulesOverwriteExisting: overwriteExistingStylesAndVariables || true,
    rulesScopeByType: scopeVariablesByTokenType || true,
    rulesIgnoreFirstPart: ignoreFirstPartForStyles || true,
    rulesPrefixStylesWithThemeName: prefixStylesWithThemeName || true,
  });

  const dispatch = useDispatch<Dispatch>();

  const handleIgnoreChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setIgnoreFirstPartForStyles(!!state);
    },
    [dispatch.settings],
  );

  const handlePrefixWithThemeNameChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setPrefixStylesWithThemeName(!!state);
    },
    [dispatch.settings],
  );

  const handleScopeChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setScopeVariablesByTokenType(!!state);
    },
    [dispatch.settings],
  );

  const handleOverwriteChange = React.useCallback(
    (state: CheckedState) => {
      dispatch.settings.setOverwriteExistingStylesAndVariables(!!state);
    },
    [dispatch.settings],
  );

  const handleChangeOption = React.useCallback((e: any) => {
    setExportOptions({ ...exportOptions, [e.target.name]: e.target.value });
  }, [exportOptions]);

  const handleSaveOptions = React.useCallback(() => {
    alert('TODO: Save options');
  }, []);

  const { t } = useTranslation(['manageStylesAndVariables', 'tokens']);

  const OptionsModal = ({ isOpen, title, closeAction }: { isOpen: boolean, title: string, closeAction: () => void }) => (
    <Modal
      size="fullscreen"
      title={title}
      backArrow
      isOpen={isOpen}
      close={closeAction}
      footer={(
        <Stack direction="row" justify="between">
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
      <Stack direction="column" align="start" gap={6} css={{ overflowY: 'scroll' }}>
        <Stack direction="column" align="start" gap={4}>
          <Stack direction="row" align="center" gap={2}>
            <SlidersIcon />
            <Heading size="medium">{t('options.title')}</Heading>
          </Stack>
          <Link target="_blank" href="https://docs.tokens.studio/">{`${t('generic.learnMore')} – ${t('docs.exportToFigmaOptions')}`}</Link>
        </Stack>
        <form>
          <Stack direction="column" justify="between" gap={5} align="start" css={{ width: '100%' }}>
            <StyledCheckboxGrid>
              <Text css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>{t('options.whichVariablesShouldBeCreatedAndUpdated')}</Text>
              <LabelledCheckbox id="variablesColor" onChange={handleChangeOption} checked={exportOptions.variablesColor} label={t('variables.color')} />
              <LabelledCheckbox id="variablesString" onChange={handleChangeOption} checked={exportOptions.variablesString} label={t('variables.string')} />
              <LabelledCheckbox id="variablesNumber" onChange={handleChangeOption} checked={exportOptions.variablesNumber} label={t('variables.number')} />
              <LabelledCheckbox id="variablesBoolean" onChange={handleChangeOption} checked={exportOptions.variablesBoolean} label={t('variables.boolean')} />
            </StyledCheckboxGrid>
            <StyledCheckboxGrid>
              <Text css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>{t('options.whichStylesShouldBeCreatedAndUpdated')}</Text>
              <LabelledCheckbox id="styleColor" onChange={handleChangeOption} checked={exportOptions.stylesColor} label={t('styles.color')} />
              <LabelledCheckbox id="stylesTypography" onChange={handleChangeOption} checked={exportOptions.stylesTypography} label={t('styles.typography')} />
              <LabelledCheckbox id="stylesEffect" onChange={handleChangeOption} checked={exportOptions.stylesEffect} label={t('styles.effects')} />
            </StyledCheckboxGrid>
            <Box css={{
              display: 'grid', gridAutoRows: 'auto', gridTemplateColumns: 'min-content max-content min-content', width: '100%', gridColumnGap: '$4', gridRowGap: '$5',
            }}
            >
              <Text css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 4 }}>{t('options.tokensExportedToFigmaShould')}</Text>

              <Switch
                data-testid="overwriteExistingStylesAndVariables"
                id="overwriteExistingStylesAndVariables"
                checked={!!overwriteExistingStylesAndVariables}
                defaultChecked={overwriteExistingStylesAndVariables}
                onCheckedChange={handleOverwriteChange}
              />
              <Label htmlFor="overwriteExistingStylesAndVariables">{t('options.overwriteExistingStylesAndVariables')}</Label>
              <ExplainerModal title={t('options.overwriteExistingStylesAndVariables')}>
                <Box as="img" src="" css={{ borderRadius: '$small' }} />
                <Box>
                  {t('options.overwriteExistingStylesAndVariablesExplanation')}
                </Box>
              </ExplainerModal>

              <Switch
                data-testid="scopeVariablesByTokenType"
                id="scopeVariablesByTokenType"
                checked={!!scopeVariablesByTokenType}
                defaultChecked={scopeVariablesByTokenType}
                onCheckedChange={handleScopeChange}
              />
              <Label htmlFor="scopeVariablesByTokenType">{t('options.scopeVariablesByTokenType')}</Label>
              <ExplainerModal title={t('options.scopeVariablesByTokenType')}>
                <Box as="img" src="" css={{ borderRadius: '$small' }} />
                <Box>
                  {t('options.scopeVariablesByTokenTypeExplanation')}
                </Box>
              </ExplainerModal>

              <Switch
                data-testid="ignoreFirstPartForStyles"
                id="ignoreFirstPartForStyles"
                checked={!!ignoreFirstPartForStyles}
                defaultChecked={ignoreFirstPartForStyles}
                onCheckedChange={handleIgnoreChange}
              />
              <Label htmlFor="ignoreFirstPartForStyles">{t('options.ignorePrefix')}</Label>
              <ExplainerModal title={t('options.ignorePrefix')}>
                <Box as="img" src={ignoreFirstPartImage} css={{ borderRadius: '$small' }} />
                <Box>{t('options.ignorePrefixExplanation')}</Box>
              </ExplainerModal>

              <Switch
                data-testid="prefixStylesWithThemeName"
                id="prefixStylesWithThemeName"
                checked={!!prefixStylesWithThemeName}
                defaultChecked={prefixStylesWithThemeName}
                onCheckedChange={handlePrefixWithThemeNameChange}
              />
              <Label htmlFor="prefixStylesWithThemeName">{t('options.prefixStyles')}</Label>
              <ExplainerModal title={t('options.prefixStyles')}>
                <Box as="img" src={prefixStylesImage} css={{ borderRadius: '$small' }} />
                <Box>{t('options.prefixStylesExplanation')}</Box>
              </ExplainerModal>

            </Box>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
  return {
    OptionsModal, exportOptions,
  };
}
