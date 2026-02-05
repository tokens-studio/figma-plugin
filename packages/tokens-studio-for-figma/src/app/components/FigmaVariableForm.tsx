import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton, Heading, Checkbox, Text, Stack, Label,
} from '@tokens-studio/ui';
import IconPlus from '@/icons/plus.svg';
import IconMinus from '@/icons/minus.svg';
import { EditTokenObject, VariableScope, CodeSyntaxPlatform } from '@/types/tokens';
import Box from './Box';
import Input from './Input';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';

import {
  VARIABLE_SCOPE_OPTIONS, TOKEN_TYPE_TO_SCOPES_MAP, CODE_SYNTAX_PLATFORM_OPTIONS,
} from '@/constants/FigmaVariableMetaData';

export default function FigmaVariableForm({
  internalEditToken,
  handleFigmaVariableChange,
  handleRemoveFigmaVariable,
}: {
  internalEditToken: EditTokenObject;
  handleFigmaVariableChange: (scopes: VariableScope[], codeSyntax: Partial<Record<CodeSyntaxPlatform, string>>, hideFromPublishing?: boolean) => void;
  handleRemoveFigmaVariable: () => void;
}) {
  const { t } = useTranslation(['tokens']);
  const [figmaVariableVisible, setFigmaVariableVisible] = React.useState(false);

  const currentScopes = useMemo(() => internalEditToken?.$extensions?.['com.figma.scopes'] as VariableScope[] || [], [internalEditToken]);

  const currentCodeSyntax = useMemo(() => internalEditToken?.$extensions?.['com.figma.codeSyntax'] as Partial<Record<CodeSyntaxPlatform, string>> || {}, [internalEditToken]);

  const currentHideFromPublishing = useMemo(() => internalEditToken?.$extensions?.['studio.tokens']?.hideFromPublishing as boolean | undefined, [internalEditToken]);

  const shouldShowFigmaVariableSection = useMemo(() => tokenTypesToCreateVariable.includes(internalEditToken.type), [internalEditToken.type]);

  // Filter variable scope options based on token type
  const relevantScopeOptions = useMemo(() => {
    const allowedScopes = TOKEN_TYPE_TO_SCOPES_MAP[internalEditToken.type] || ['ALL_SCOPES'];
    return VARIABLE_SCOPE_OPTIONS.filter((option) => allowedScopes.includes(option.value));
  }, [internalEditToken.type]);

  React.useEffect(() => {
    if (internalEditToken?.$extensions?.['com.figma.scopes']
        || internalEditToken?.$extensions?.['com.figma.codeSyntax']
        || internalEditToken?.$extensions?.['studio.tokens']?.hideFromPublishing !== undefined) {
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

    if (scope === 'ALL_SCOPES') {
      // If selecting ALL_SCOPES, clear all other scopes
      // If deselecting ALL_SCOPES, keep other scopes as they are
      newScopes = checked ? ['ALL_SCOPES'] : currentScopes.filter((s) => s !== 'ALL_SCOPES');
    } else if (checked) {
      // If selecting any other scope, add it and remove ALL_SCOPES
      newScopes = [...currentScopes.filter((s) => s !== 'ALL_SCOPES'), scope];
    } else {
      // If deselecting, just remove the specific scope
      newScopes = currentScopes.filter((s) => s !== scope);
    }

    handleFigmaVariableChange(newScopes, currentCodeSyntax, currentHideFromPublishing);
  }, [currentScopes, currentCodeSyntax, currentHideFromPublishing, handleFigmaVariableChange]);

  const handleCodeSyntaxPlatformChange = useCallback((platform: CodeSyntaxPlatform, checked: boolean) => {
    const newCodeSyntax = { ...currentCodeSyntax };
    if (checked) {
      newCodeSyntax[platform] = '';
    } else {
      delete newCodeSyntax[platform];
    }
    handleFigmaVariableChange(currentScopes, newCodeSyntax, currentHideFromPublishing);
  }, [currentScopes, currentCodeSyntax, currentHideFromPublishing, handleFigmaVariableChange]);

  const handleCodeSyntaxValueChange = useCallback((platform: CodeSyntaxPlatform, value: string) => {
    const newCodeSyntax = { ...currentCodeSyntax };
    newCodeSyntax[platform] = value;
    handleFigmaVariableChange(currentScopes, newCodeSyntax, currentHideFromPublishing);
  }, [currentScopes, currentCodeSyntax, currentHideFromPublishing, handleFigmaVariableChange]);

  const handleScopeCheckedChange = useCallback((scope: VariableScope) => (checked: boolean | string) => {
    handleScopeChange(scope, !!checked);
  }, [handleScopeChange]);

  const handleCodeSyntaxCheckedChange = useCallback((platform: CodeSyntaxPlatform) => (checked: boolean | string) => {
    handleCodeSyntaxPlatformChange(platform, !!checked);
  }, [handleCodeSyntaxPlatformChange]);

  const handleCodeSyntaxInputChange = useCallback((platform: CodeSyntaxPlatform) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCodeSyntaxValueChange(platform, e.target.value);
  }, [handleCodeSyntaxValueChange]);

  const handleHideFromPublishingChange = useCallback(() => {
    // Handle three-way checkbox cycling:
    // indeterminate (undefined) -> checked (true) -> unchecked (false) -> indeterminate (undefined)
    let newValue: boolean | undefined;

    if (currentHideFromPublishing === undefined) {
      // Currently indeterminate, user clicked -> set to checked (true)
      newValue = true;
    } else if (currentHideFromPublishing === true) {
      // Currently checked, user clicked -> set to unchecked (false)
      newValue = false;
    } else {
      // Currently unchecked (false), user clicked -> set to indeterminate (undefined)
      newValue = undefined;
    }

    handleFigmaVariableChange(currentScopes, currentCodeSyntax, newValue);
  }, [currentScopes, currentCodeSyntax, currentHideFromPublishing, handleFigmaVariableChange]);

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
                  {t('variableScopes')}
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
                {t('codeSyntax')}
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

            <Box>
              <Text muted size="small" css={{ marginBottom: '$2' }}>
                {t('publishing')}
              </Text>
              <Stack direction="row" gap={2} css={{ alignItems: 'center' }}>
                <Checkbox
                  id="hide-from-publishing"
                  checked={currentHideFromPublishing === undefined ? 'indeterminate' : currentHideFromPublishing}
                  onCheckedChange={handleHideFromPublishingChange}
                />
                <Label css={{ fontWeight: '$sansRegular', fontSize: '$small' }} htmlFor="hide-from-publishing">
                  {t('hideFromPublishing')}
                </Label>
              </Stack>
            </Box>
          </Stack>
        )
      }
    </>
  );
}
