import React from 'react';
import {
  Checkbox, Stack, Label, Box, Heading, Link,
} from '@tokens-studio/ui';
import { SlidersIcon } from '@primer/octicons-react';
import { styled } from '@stitches/react';

const StyledCheckboxGrid = styled(Box, {
  display: 'grid', gridTemplateColumns: 'min-content 1fr', gridGap: '$3', alignItems: 'center',
});

export default function Options() {
  // TODO: This is the state that needs to be saved, it should be stored on the document.
  // If a user cancels this dialog, the state should be reverted to the last saved state.

  const [exportOptions, setExportOptions] = React.useState({
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
      ingoreFirstPart: true,
      prefixStylesWithThemeName: true,
    },
  });

  return (
    <Stack direction="column" align="start" gap={6}>
      <Stack direction="column" align="start" gap={4}>
        <Stack direction="row" align="center" gap={2}>
          <SlidersIcon />
          <Heading size="medium">Options</Heading>
        </Stack>
        {/* TODO: URL for the link */}
        <Link href="https://docs.tokens.studio/">Learn More: Export to Figma options</Link>
      </Stack>
      <form>
        <Stack direction="column" justify="between" gap={5} align="start" css={{ width: '100%' }}>
          <StyledCheckboxGrid>
            <Label css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>What variables will be created and updated?</Label>
            <Checkbox id="checkbox-color" checked={exportOptions.variables.color} />
            <Label>Color</Label>
            <Checkbox id="checkbox-string" checked={exportOptions.variables.string} />

            <Label>String</Label>
            <Checkbox id="checkbox-number" checked={exportOptions.variables.number} />

            <Label>Number & Dimension</Label>
            <Checkbox id="checkbox-number" checked={exportOptions.variables.boolean} />
            <Label>Boolean</Label>
          </StyledCheckboxGrid>
          <StyledCheckboxGrid>
            <Label css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>What styles will be created and updated?</Label>
            <Checkbox id="checkbox-styles-color" checked={exportOptions.styles.color} />
            <Label>Color</Label>
            <Checkbox id="checkbox-styles-typography" checked={exportOptions.styles.typography} />
            <Label>Typography</Label>
            <Checkbox id="checkbox-styles-effect" checked={exportOptions.styles.effect} />
            <Label>Effects</Label>
          </StyledCheckboxGrid>
          <StyledCheckboxGrid>
            <Label css={{ fontSize: '$medium', gridColumnStart: 1, gridColumnEnd: 3 }}>Tokens exported to Figma should:</Label>
            <Checkbox id="checkbox-styles-color" checked={exportOptions.rules.overwriteExisting} />
            <Label>Overwrite existing styles and variables</Label>
            <Checkbox id="checkbox-styles-typography" checked={exportOptions.rules.scopeByType} />
            <Label>Scope variables by token type</Label>
            <Checkbox id="checkbox-styles-effect" checked={exportOptions.rules.ingoreFirstPart} />
            <Label>Ignore first part of token name for styles</Label>
            <Checkbox id="checkbox-styles-effect" checked={exportOptions.rules.prefixStylesWithThemeName} />
            <Label>Prefix styles with theme name</Label>
          </StyledCheckboxGrid>
        </Stack>
      </form>
    </Stack>
  );
}
