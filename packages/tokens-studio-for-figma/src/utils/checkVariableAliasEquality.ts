import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { normalizeVariableName } from '@/utils/normalizeVariableName';

/**
 * Checks if a variable alias already points to the correct variable based on the token's reference.
 * This prevents unnecessary updates when the alias already references the intended variable.
 *
 * @param existingValue - The current value of the variable (could be an alias or direct value)
 * @param rawValue - The raw value from the token (e.g., "{accent.default}")
 * @returns true if the alias already points to the correct variable, false otherwise
 */
export function checkVariableAliasEquality(existingValue: VariableValue, rawValue?: string): boolean {
  // Only proceed if we have an alias reference and a rawValue with reference syntax
  if (
    !isVariableWithAliasReference(existingValue)
    || !rawValue
    || !rawValue.startsWith('{')
    || !rawValue.endsWith('}')
  ) {
    return false;
  }

  try {
    // Extract reference name from token's rawValue (e.g., "{accent.default}" -> "accent.default")
    const referenceName = rawValue.slice(1, -1);

    // Get the referenced variable name from the alias
    const referencedVariable = figma.variables.getVariableById(existingValue.id);
    const referencedVariableName = referencedVariable?.name;

    if (!referencedVariableName) {
      return false;
    }

    // Normalize both names for comparison
    const normalizedReferencedName = normalizeVariableName(referencedVariableName);
    const normalizedReferenceName = normalizeVariableName(referenceName);

    // If they match, the alias already points to the correct variable
    return normalizedReferencedName === normalizedReferenceName;
  } catch (e) {
    console.error('Error checking variable alias equality:', e);
    return false;
  }
}
