import React from 'react';
import { Label, Stack, Checkbox } from '@tokens-studio/ui';
import { VariableScope, VARIABLE_SCOPE_OPTIONS } from '@/types/FigmaVariableTypes';
import Text from './Text';

type Props = {
  selectedScopes: VariableScope[];
  onScopesChange: (scopes: VariableScope[]) => void;
  label?: string;
};

export default function VariableScopesInput({ selectedScopes, onScopesChange, label = "Variable Scopes" }: Props) {
  const handleScopeToggle = React.useCallback((scope: VariableScope, checked: boolean) => {
    if (checked) {
      // Add scope if not already present
      if (!selectedScopes.includes(scope)) {
        const newScopes = [...selectedScopes, scope];
        onScopesChange(newScopes);
      }
    } else {
      // Remove scope
      const newScopes = selectedScopes.filter(s => s !== scope);
      onScopesChange(newScopes);
    }
  }, [selectedScopes, onScopesChange]);

  return (
    <Stack direction="column" gap={2}>
      <Label>{label}</Label>
      <Text muted size="small">
        Define where this variable can be used in Figma
      </Text>
      <Stack direction="column" gap={1} css={{ maxHeight: '200px', overflowY: 'auto' }}>
        {VARIABLE_SCOPE_OPTIONS.map((option) => (
          <Stack key={option.value} direction="row" gap={2} align="center">
            <Checkbox
              checked={selectedScopes.includes(option.value)}
              onCheckedChange={(checked) => handleScopeToggle(option.value, !!checked)}
              id={`scope-${option.value}`}
            />
            <Stack direction="column" gap={0}>
              <Label htmlFor={`scope-${option.value}`} css={{ cursor: 'pointer' }}>
                {option.label}
              </Label>
              {option.description && (
                <Text muted size="xsmall">
                  {option.description}
                </Text>
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}