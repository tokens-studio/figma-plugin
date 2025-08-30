import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton, Heading, Checkbox, Text, Stack, Label,
} from '@tokens-studio/ui';
import IconPlus from '@/icons/plus.svg';
import IconMinus from '@/icons/minus.svg';
import { EditTokenObject } from '@/types/tokens';
import Box from './Box';
import Input from './Input';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';

type VariableScope = 'ALL_SCOPES' | 'TEXT_CONTENT' | 'CORNER_RADIUS' | 'WIDTH_HEIGHT' | 'GAP' | 'OPACITY' | 'STROKE_FLOAT' | 'EFFECT_FLOAT' | 'FONT_WEIGHT' | 'FONT_SIZE' | 'LINE_HEIGHT' | 'LETTER_SPACING' | 'PARAGRAPH_SPACING' | 'PARAGRAPH_INDENT' | 'ALL_FILLS' | 'FRAME_FILL' | 'SHAPE_FILL' | 'TEXT_FILL' | 'STROKE_COLOR' | 'EFFECT_COLOR' | 'FONT_FAMILY' | 'FONT_STYLE';
type CodeSyntaxPlatform = 'Web' | 'Android' | 'iOS';

const variableScopeOptions: { value: VariableScope; label: string }[] = [
  { value: 'ALL_SCOPES', label: 'All scopes' },
  { value: 'TEXT_CONTENT', label: 'Text content' },
  { value: 'CORNER_RADIUS', label: 'Corner radius' },
  { value: 'WIDTH_HEIGHT', label: 'Width & height' },
  { value: 'GAP', label: 'Gap' },
  { value: 'OPACITY', label: 'Opacity' },
  { value: 'STROKE_FLOAT', label: 'Stroke float' },
  { value: 'EFFECT_FLOAT', label: 'Effect float' },
  { value: 'FONT_WEIGHT', label: 'Font weight' },
  { value: 'FONT_SIZE', label: 'Font size' },
  { value: 'LINE_HEIGHT', label: 'Line height' },
  { value: 'LETTER_SPACING', label: 'Letter spacing' },
  { value: 'PARAGRAPH_SPACING', label: 'Paragraph spacing' },
  { value: 'PARAGRAPH_INDENT', label: 'Paragraph indent' },
  { value: 'ALL_FILLS', label: 'All fills' },
  { value: 'FRAME_FILL', label: 'Frame fill' },
  { value: 'SHAPE_FILL', label: 'Shape fill' },
  { value: 'TEXT_FILL', label: 'Text fill' },
  { value: 'STROKE_COLOR', label: 'Stroke color' },
  { value: 'EFFECT_COLOR', label: 'Effect color' },
  { value: 'FONT_FAMILY', label: 'Font family' },
  { value: 'FONT_STYLE', label: 'Font style' },
];

const codeSyntaxPlatformOptions: { value: CodeSyntaxPlatform; label: string }[] = [
  { value: 'Web', label: 'Web' },
  { value: 'Android', label: 'Android' },
  { value: 'iOS', label: 'iOS' },
];

export default function FigmaVariableForm({
  internalEditToken,
  handleFigmaVariableChange,
  handleRemoveFigmaVariable,
}: {
  internalEditToken: EditTokenObject;
  handleFigmaVariableChange: (scopes: VariableScope[], codeSyntax: Partial<Record<CodeSyntaxPlatform, string>>) => void;
  handleRemoveFigmaVariable: () => void;
}) {
  const { t } = useTranslation(['tokens']);
  const [figmaVariableVisible, setFigmaVariableVisible] = React.useState(false);

  const currentScopes = useMemo(() => {
    return internalEditToken?.$extensions?.['com.figma']?.scopes as VariableScope[] || [];
  }, [internalEditToken]);

  const currentCodeSyntax = useMemo(() => {
    return internalEditToken?.$extensions?.['com.figma']?.codeSyntax as Partial<Record<CodeSyntaxPlatform, string>> || {};
  }, [internalEditToken]);

  const shouldShowFigmaVariableSection = useMemo(() => {
    return tokenTypesToCreateVariable.includes(internalEditToken.type);
  }, [internalEditToken.type]);

  React.useEffect(() => {
    if (internalEditToken?.$extensions?.['com.figma']?.scopes || internalEditToken?.$extensions?.['com.figma']?.codeSyntax) {
      setFigmaVariableVisible(true);
    }
  }, [internalEditToken]);

  const addFigmaVariable = useCallback(() => {
    setFigmaVariableVisible(true);
    handleFigmaVariableChange([], {});
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
      newScopes = checked ? ['ALL_SCOPES'] : currentScopes.filter(s => s !== 'ALL_SCOPES');
    } else {
      // If selecting any other scope, add it and remove ALL_SCOPES
      // If deselecting, just remove the specific scope
      if (checked) {
        newScopes = [...currentScopes.filter(s => s !== 'ALL_SCOPES'), scope];
      } else {
        newScopes = currentScopes.filter(s => s !== scope);
      }
    }
    
    handleFigmaVariableChange(newScopes, currentCodeSyntax);
  }, [currentScopes, currentCodeSyntax, handleFigmaVariableChange]);

  const handleCodeSyntaxPlatformChange = useCallback((platform: CodeSyntaxPlatform, checked: boolean) => {
    const newCodeSyntax = { ...currentCodeSyntax };
    if (checked) {
      newCodeSyntax[platform] = '';
    } else {
      delete newCodeSyntax[platform];
    }
    handleFigmaVariableChange(currentScopes, newCodeSyntax);
  }, [currentScopes, currentCodeSyntax, handleFigmaVariableChange]);

  const handleCodeSyntaxValueChange = useCallback((platform: CodeSyntaxPlatform, value: string) => {
    const newCodeSyntax = { ...currentCodeSyntax };
    newCodeSyntax[platform] = value;
    handleFigmaVariableChange(currentScopes, newCodeSyntax);
  }, [currentScopes, currentCodeSyntax, handleFigmaVariableChange]);

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
          <Stack gap={3} direction="column">
            <Box>
              <Text muted size="small" css={{ marginBottom: '$2' }}>
                Variable scopes
              </Text>
              <Stack gap={2} direction="column">
                {variableScopeOptions.map((option) => (
                  <Stack key={option.value} direction="row" gap={2} css={{ alignItems: 'center' }}>
                    <Checkbox
                      id={`scope-${option.value}`}
                      checked={currentScopes.includes(option.value)}
                      onCheckedChange={(checked) => handleScopeChange(option.value, !!checked)}
                    />
                    <Label css={{ fontWeight: '$sansRegular', fontSize: '$small' }} htmlFor={`scope-${option.value}`}>
                      {option.label}
                    </Label>
                  </Stack>
                ))}
              </Stack>
            </Box>
            
            <Box>
              <Text muted size="small" css={{ marginBottom: '$2' }}>
                Code syntax
              </Text>
              <Stack gap={2} direction="column">
                {codeSyntaxPlatformOptions.map((option) => (
                  <Box key={option.value} css={{ display: 'flex', alignItems: 'center', gap: '$3' }}>
                    <Stack direction="row" gap={2} css={{ alignItems: 'center', minWidth: '80px' }}>
                      <Checkbox
                        id={`syntax-${option.value}`}
                        checked={option.value in currentCodeSyntax}
                        onCheckedChange={(checked) => handleCodeSyntaxPlatformChange(option.value, !!checked)}
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
                          onChange={(e) => handleCodeSyntaxValueChange(option.value, e.target.value)}
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