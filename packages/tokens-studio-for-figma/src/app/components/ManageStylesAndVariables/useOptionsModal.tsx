import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox, Stack, Label, Box, Heading, Link, Button,
} from '@tokens-studio/ui';
import {
  ChevronLeftIcon, SlidersIcon,
} from '@primer/octicons-react';
import { styled } from '@stitches/react';
import { Modal } from '../Modal/Modal';

const StyledCheckboxGrid = styled(Box, {
  display: 'grid', gridTemplateColumns: 'min-content 1fr', gridGap: '$3', alignItems: 'center',
});

type ExportOptions = {
  variables: {
    color: boolean;
    string: boolean;
    number: boolean;
    boolean: boolean;
  };
  styles: {
    color: boolean;
    typography: boolean;
    effect: boolean;
  };
  rules: {
    overwriteExisting: boolean;
    scopeByType: boolean;
    ignoreFirstPart: boolean;
    prefixStylesWithThemeName: boolean;
  };
};

const LabelledCheckbox = ({
  label, id, checked,
} : { label: string, id: string, checked: boolean }) => (
  <>
    <Checkbox id={id} checked={checked} />
    <Label css={{ fontWeight: '$sansRegular' }} htmlFor={id}>{label}</Label>
  </>
);

export default function useOptionsModal() {
  // TODO: This is the state that needs to be saved, it should be stored on the document.
  // If a user cancels this dialog, the state should be reverted to the last saved state.
  const [exportOptions, setExportOptions] = React.useState<ExportOptions>({
    variables: {
      color: true,
      string: true,
      number: true,
      boolean: true,
    },
    styles: {
      color: true,
      typography: true,
      effect: true,
    },
    rules: {
      overwriteExisting: true,
      scopeByType: true,
      ignoreFirstPart: true,
      prefixStylesWithThemeName: true,
    },
  });

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
              <LabelledCheckbox id="variables-color" checked={exportOptions.variables.color} label="Color" />
              <LabelledCheckbox id="variables-string" checked={exportOptions.variables.string} label="String" />
              <LabelledCheckbox id="variables-number" checked={exportOptions.variables.number} label="Number & Dimension" />
              <LabelledCheckbox id="variables-boolean" checked={exportOptions.variables.boolean} label="Boolean" />
            </StyledCheckboxGrid>
            <StyledCheckboxGrid>
              <Label css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>What styles will be created and updated?</Label>
              <LabelledCheckbox id="styles-color" checked={exportOptions.styles.color} label="Color" />
              <LabelledCheckbox id="styles-typography" checked={exportOptions.styles.typography} label="Typography" />
              <LabelledCheckbox id="styles-effect" checked={exportOptions.styles.effect} label="Effects" />
            </StyledCheckboxGrid>
            <StyledCheckboxGrid>
              <Label css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>Tokens exported to Figma should:</Label>
              <LabelledCheckbox id="rules-overwrite-existing" checked={exportOptions.rules.overwriteExisting} label="Overwrite existing styles and variable" />
              <LabelledCheckbox id="rules-scope-by-type" checked={exportOptions.rules.scopeByType} label="Scope variables by token type" />
              <LabelledCheckbox id="rules-ignore-first-part" checked={exportOptions.rules.ignoreFirstPart} label="Ignore first part of token name for styles" />
              <LabelledCheckbox id="rules-prefix-with-theme-name" checked={exportOptions.rules.prefixStylesWithThemeName} label="Prefix styles with theme name" />
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
