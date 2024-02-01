import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stack, Label, Box, Heading, Link, Button,
} from '@tokens-studio/ui';
import {
  ChevronLeftIcon, SlidersIcon,
} from '@primer/octicons-react';
import { styled } from '@stitches/react';
import { Modal } from '../Modal/Modal';
import { LabelledCheckbox } from './LabelledCheckbox';

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
    rulesOverwriteExisting: true,
    rulesScopeByType: true,
    rulesIgnoreFirstPart: true,
    rulesPrefixStylesWithThemeName: true,
  });

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

          <Button variant="primary" id="pullDialog-button-override" onClick={handleSaveOptions}>
            {t('actions.confirm')}
          </Button>

        </Stack>
)}
      stickyFooter
    >
      <Stack direction="column" align="start" gap={6}>
        <Stack direction="column" align="start" gap={4}>
          <Stack direction="row" align="center" gap={2}>
            <SlidersIcon />
            <Heading size="medium">Options</Heading>
          </Stack>
          {/* TODO: URL for the link */}
          <Link target="_blank" href="https://docs.tokens.studio/">Learn More: Export to Figma options</Link>
        </Stack>
        <form>
          <Stack direction="column" justify="between" gap={5} align="start" css={{ width: '100%' }}>
            <StyledCheckboxGrid>
              <Label css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>What variables will be created and updated?</Label>
              <LabelledCheckbox id="variables-color" name="variablesColor" onChange={handleChangeOption} checked={exportOptions.variablesColor} label="Color" />
              <LabelledCheckbox id="variables-string" name="variablesString" onChange={handleChangeOption} checked={exportOptions.variablesString} label="String" />
              <LabelledCheckbox id="variables-number" name="variablesNumber" onChange={handleChangeOption} checked={exportOptions.variablesNumber} label="Number & Dimension" />
              <LabelledCheckbox id="variables-boolean" name="variablesBoolean" onChange={handleChangeOption} checked={exportOptions.variablesBoolean} label="Boolean" />
            </StyledCheckboxGrid>
            <StyledCheckboxGrid>
              <Label css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>What styles will be created and updated?</Label>
              <LabelledCheckbox id="styles-color" name="stylesColor" onChange={handleChangeOption} checked={exportOptions.stylesColor} label="Color" />
              <LabelledCheckbox id="styles-typography" name="stylesTypography" onChange={handleChangeOption} checked={exportOptions.stylesTypography} label="Typography" />
              <LabelledCheckbox id="styles-effect" name="stylesEffect" onChange={handleChangeOption} checked={exportOptions.stylesEffect} label="Effects" />
            </StyledCheckboxGrid>
            <StyledCheckboxGrid>
              <Label css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>Tokens exported to Figma should:</Label>
              <LabelledCheckbox id="rules-overwrite-existing" name="rulesOverwriteExisting" onChange={handleChangeOption} checked={exportOptions.rulesOverwriteExisting} label="Overwrite existing styles and variables" />
              <LabelledCheckbox id="rules-scope-by-type" name="rulesScopeByType" onChange={handleChangeOption} checked={exportOptions.rulesScopeByType} label="Scope variables by token type" />
              <LabelledCheckbox id="rules-ignore-first-part" name="rulesIgnoreFirstPart" onChange={handleChangeOption} checked={exportOptions.rulesIgnoreFirstPart} label="Ignore first part of token name for styles" />
              <LabelledCheckbox id="rules-prefix-with-theme-name" name="rulesPrefixWithThemeName" onChange={handleChangeOption} checked={exportOptions.rulesPrefixStylesWithThemeName} label="Prefix styles with theme name" />
            </StyledCheckboxGrid>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
  return {
    OptionsModal, exportOptions,
  };
}
