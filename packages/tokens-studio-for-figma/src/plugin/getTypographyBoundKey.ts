export function getTypographyBoundKey(style: TextStyle, requestedKey: string): VariableBindableTextField {
  // Centralized helper: for typography weight, prefer 'fontWeight' when a numeric variable is bound, otherwise use 'fontStyle'.
  if ((requestedKey === 'fontWeight' || requestedKey === 'fontStyle')) {
    if (style?.boundVariables?.fontWeight?.id) return 'fontWeight';
    return 'fontStyle';
  }
  return requestedKey as VariableBindableTextField;
}
