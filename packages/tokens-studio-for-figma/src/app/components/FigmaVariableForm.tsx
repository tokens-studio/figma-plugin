import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton, Heading, Checkbox, Text, Stack, Label,
} from '@tokens-studio/ui';
import Tooltip from './Tooltip';
import IconPlus from '@/icons/plus.svg';
import IconMinus from '@/icons/minus.svg';
import { EditTokenObject, VariableScope, CodeSyntaxPlatform } from '@/types/tokens';
import Box from './Box';
import Input from './Input';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';

import {
  VARIABLE_SCOPE_OPTIONS, TOKEN_TYPE_TO_SCOPES_MAP, CODE_SYNTAX_PLATFORM_OPTIONS,
} from '@/constants/FigmaVariableMetaData';
import { track } from '@/utils/analytics';

export default function FigmaVariableForm({
  internalEditToken,
  handleFigmaVariableChange,
  handleRemoveFigmaVariable,
}: {
  internalEditToken: EditTokenObject;
  handleFigmaVariableChange: (scopes: VariableScope[], codeSyntax: Partial<Record<CodeSyntaxPlatform, string>>, hiddenFromPublishing?: boolean) => void;
  handleRemoveFigmaVariable: () => void;
}) {
  const { t } = useTranslation(['tokens']);
  const [figmaVariableVisible, setFigmaVariableVisible] = React.useState(false);

  const currentScopes = useMemo(() => internalEditToken?.$extensions?.['com.figma.scopes'] as VariableScope[] || [], [internalEditToken]);

  const currentCodeSyntax = useMemo(() => internalEditToken?.$extensions?.['com.figma.codeSyntax'] as Partial<Record<CodeSyntaxPlatform, string>> || {}, [internalEditToken]);

  const currentHiddenFromPublishing = useMemo(() => internalEditToken?.$extensions?.['com.figma.hiddenFromPublishing'] as boolean | undefined, [internalEditToken]);

  const shouldShowFigmaVariableSection = useMemo(() => tokenTypesToCreateVariable.includes(internalEditToken.type), [internalEditToken.type]);

  // Filter variable scope options based on token type
  const relevantScopeOptions = useMemo(() => {
    const allowedScopes = TOKEN_TYPE_TO_SCOPES_MAP[internalEditToken.type] || ['ALL_SCOPES'];
    return VARIABLE_SCOPE_OPTIONS.filter((option) => allowedScopes.includes(option.value));
  }, [internalEditToken.type]);

  React.useEffect(() => {
    if (internalEditToken?.$extensions?.['com.figma.scopes'] || internalEditToken?.$extensions?.['com.figma.codeSyntax'] || typeof internalEditToken?.$extensions?.['com.figma.hiddenFromPublishing'] === 'boolean') {
      setFigmaVariableVisible(true);
    }
  }, [internalEditToken]);

  const addFigmaVariable = useCallback(() => {
    setFigmaVariableVisible(true);
    handleFigmaVariableChange([], {}, undefined);
  }, [handleFigmaVariableChange]);

  const removeFigmaVariable = useCallback(() => {
    setFigmaVariableVisible(false);
    handleRemoveFigmaVariable();
  }, [handleRemoveFigmaVariable]);

  const handleScopeChange = useCallback((scope: VariableScope, checked: boolean) => {
    let newScopes: VariableScope[];
    track('Select variable scope', { scope, checked });

    if (scope === 'ALL_SCOPES') {
      // If selecting ALL_SCOPES, clear all other scopes
      newScopes = checked ? ['ALL_SCOPES'] : [];
    } else if (scope === 'NONE') {
      // If selecting NONE, clear all other scopes
      newScopes = checked ? ['NONE'] : [];
    } else if (checked) {
      // If selecting any other scope, add it and remove ALL_SCOPES and NONE
      newScopes = [...currentScopes.filter((s) => s !== 'ALL_SCOPES' && s !== 'NONE'), scope];
    } else {
      // If deselecting, just remove the specific scope
      newScopes = currentScopes.filter((s) => s !== scope);
    }

    handleFigmaVariableChange(newScopes, currentCodeSyntax, currentHiddenFromPublishing);
  }, [currentScopes, currentCodeSyntax, currentHiddenFromPublishing, handleFigmaVariableChange]);


  const handleCodeSyntaxPlatformChange = useCallback((platform: CodeSyntaxPlatform, checked: boolean) => {
    const newCodeSyntax = { ...currentCodeSyntax };
    if (checked) {
      newCodeSyntax[platform] = '';
    } else {
      delete newCodeSyntax[platform];
    }
    handleFigmaVariableChange(currentScopes, newCodeSyntax, currentHiddenFromPublishing);
  }, [currentScopes, currentCodeSyntax, currentHiddenFromPublishing, handleFigmaVariableChange]);

  const handleCodeSyntaxValueChange = useCallback((platform: CodeSyntaxPlatform, value: string) => {
    const newCodeSyntax = { ...currentCodeSyntax };
    newCodeSyntax[platform] = value;
    handleFigmaVariableChange(currentScopes, newCodeSyntax, currentHiddenFromPublishing);
  }, [currentScopes, currentCodeSyntax, currentHiddenFromPublishing, handleFigmaVariableChange]);

  const handleScopeCheckedChange = useCallback((scope: VariableScope) => (checked: boolean | string) => {
    handleScopeChange(scope, !!checked);
  }, [handleScopeChange]);

  const handleCodeSyntaxCheckedChange = useCallback((platform: CodeSyntaxPlatform) => (checked: boolean | string) => {
    handleCodeSyntaxPlatformChange(platform, !!checked);
  }, [handleCodeSyntaxPlatformChange]);

  const handleCodeSyntaxInputChange = useCallback((platform: CodeSyntaxPlatform) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCodeSyntaxValueChange(platform, e.target.value);
  }, [handleCodeSyntaxValueChange]);

  // Three-state cycle: indeterminate (undefined) → true → false → indeterminate (undefined)
  const handleHiddenFromPublishingCheckedChange = useCallback(() => {
    let nextValue: boolean | undefined;
    if (currentHiddenFromPublishing === undefined) {
      nextValue = true;
    } else if (currentHiddenFromPublishing === true) {
      nextValue = false;
    } else {
      nextValue = undefined; // back to indeterminate — removes the extension key
    }
    track('Set hidden from publishing', { checked: nextValue });
    handleFigmaVariableChange(currentScopes, currentCodeSyntax, nextValue);
  }, [currentHiddenFromPublishing, currentScopes, currentCodeSyntax, handleFigmaVariableChange]);

  let hiddenFromPublishingTooltip: string;
  if (currentHiddenFromPublishing === true) {
    hiddenFromPublishingTooltip = t('figmaVariable.hiddenFromPublishing.tooltipOn');
  } else if (currentHiddenFromPublishing === false) {
    hiddenFromPublishingTooltip = t('figmaVariable.hiddenFromPublishing.tooltipOff');
  } else {
    hiddenFromPublishingTooltip = t('figmaVariable.hiddenFromPublishing.tooltipNotSet');
  }

  if (!shouldShowFigmaVariableSection) {
    return null;
  }

  return (
    <>
      <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading size="small">Figma</Heading>
        {
          !figmaVariableVisible ? (
            <IconButton
              tooltip="Configure Figma variable settings"
              data-testid="button-add-figma-variable"
              onClick={addFigmaVariable}
              icon={<IconPlus />}
              variant="invisible"
            />
          ) : (
            <IconButton
              tooltip="Remove Figma variable settings"
              data-testid="button-remove-figma-variable"
              onClick={removeFigmaVariable}
              icon={<IconMinus />}
              variant="invisible"
            />
          )
        }
      </Box>
      {
        figmaVariableVisible && (
          <Stack gap={5} direction="column">
            {relevantScopeOptions.length > 0 && (
              <Box>
                <Text muted size="small" css={{ marginBottom: '$2' }}>
                  Variable scopes
                </Text>
                <Stack gap={3} direction="column">
                  {relevantScopeOptions.map((option) => {
                    const isSubFillOption = ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL'].includes(option.value);
                    return (
                      <Stack
                        key={option.value}
                        direction="row"
                        gap={2}
                        css={{
                          alignItems: 'center',
                          paddingLeft: isSubFillOption ? '$4' : '0',
                        }}
                      >
                        <Checkbox
                          id={`scope-${option.value}`}
                          checked={currentScopes.includes(option.value)}
                          onCheckedChange={handleScopeCheckedChange(option.value)}
                        />
                        <Label css={{ fontWeight: '$sansRegular', fontSize: '$small' }} htmlFor={`scope-${option.value}`}>
                          {option.label}
                        </Label>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            )}

            <Box>
              <Text muted size="small" css={{ marginBottom: '$2' }}>
                Variable settings
              </Text>
              <Box css={{ display: 'inline-flex', alignItems: 'center', gap: '$2' }}>
                <Tooltip
                  label={hiddenFromPublishingTooltip}
                  side="top"
                >
                  <span>
                    <Checkbox
                      id="hiddenFromPublishing"
                      checked={currentHiddenFromPublishing === undefined ? 'indeterminate' : currentHiddenFromPublishing}
                      onCheckedChange={handleHiddenFromPublishingCheckedChange}
                    />
                  </span>
                </Tooltip>
                <Label css={{ fontWeight: '$sansRegular', fontSize: '$small' }} htmlFor="hiddenFromPublishing">
                  {t('figmaVariable.hiddenFromPublishing.label')}
                </Label>
              </Box>
            </Box>

            <Box>
              <Text muted size="small" css={{ marginBottom: '$2' }}>
                Code syntax
              </Text>
              <Stack gap={3} direction="column">
                {CODE_SYNTAX_PLATFORM_OPTIONS.map((option) => (
                  <Box key={option.value} css={{ display: 'flex', alignItems: 'center', gap: '$3' }}>
                    <Stack direction="row" gap={2} css={{ alignItems: 'center', minWidth: '80px' }}>
                      <Checkbox
                        id={`syntax-${option.value}`}
                        checked={option.value in currentCodeSyntax}
                        onCheckedChange={handleCodeSyntaxCheckedChange(option.value)}
                      />
                      <Label css={{ fontWeight: '$sansRegular', fontSize: '$small' }} htmlFor={`syntax-${option.value}`}>
                        {option.label}
                      </Label>
                    </Stack>
                    {option.value in currentCodeSyntax && (
                      <Box css={{ flex: 1 }}>
                        <Input
                          full
                          value={currentCodeSyntax[option.value] || ''}
                          onChange={handleCodeSyntaxInputChange(option.value)}
                          placeholder={`${option.label} syntax (e.g., --token-name)`}
                          type="text"
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        )
      }
    </>
  );
}
