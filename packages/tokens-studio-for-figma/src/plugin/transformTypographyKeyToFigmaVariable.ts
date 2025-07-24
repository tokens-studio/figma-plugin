export function transformTypographyKeyToFigmaVariable(key: string, variableToApply?: Variable): VariableBindableTextField {
  // Figma distinguishes between numerical and alphabetical weights, if numerical the key is fontWeight, if alphabetical it's fontStyle
  if (key === 'fontWeight' && variableToApply) {
    if (variableToApply.resolvedType === 'FLOAT') return 'fontWeight';
    return 'fontStyle';
  }
  return key as VariableBindableTextField;
}
