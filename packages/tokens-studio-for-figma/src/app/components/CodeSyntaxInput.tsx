import React from 'react';
import { Label, Stack } from '@tokens-studio/ui';
import { CodeSyntaxPlatform, CODE_SYNTAX_PLATFORM_OPTIONS } from '@/types/FigmaVariableTypes';
import Input from './Input';
import Text from './Text';

type Props = {
  codeSyntax: { [K in CodeSyntaxPlatform]?: string };
  onCodeSyntaxChange: (platform: CodeSyntaxPlatform, value: string) => void;
  label?: string;
};

export default function CodeSyntaxInput({ codeSyntax, onCodeSyntaxChange, label = "Code Syntax" }: Props) {
  const handleInputChange = React.useCallback((platform: CodeSyntaxPlatform) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onCodeSyntaxChange(platform, e.target.value);
  }, [onCodeSyntaxChange]);

  return (
    <Stack direction="column" gap={2}>
      <Label>{label}</Label>
      <Text muted size="small">
        Define custom code syntax for different platforms
      </Text>
      <Stack direction="column" gap={2}>
        {CODE_SYNTAX_PLATFORM_OPTIONS.map((platform) => (
          <Input
            key={platform.value}
            label={platform.label}
            value={codeSyntax[platform.value] || ''}
            onChange={handleInputChange(platform.value)}
            placeholder={`e.g., $${platform.value.toLowerCase()}-token-name`}
            type="text"
          />
        ))}
      </Stack>
    </Stack>
  );
}