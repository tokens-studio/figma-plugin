import { TokenTypes } from '@/constants/TokenTypes';
import { StyleToCreateToken } from '@/types/payloads';

export function processTextStyleProperty(
  style: TextStyle,
  propertyKey: string,
  localVariables: Variable[],
  _tokens: any,
  tokenType: TokenTypes,
  defaultNamePrefix: string,
  idx: number,
  valueTransformer?: (value: any) => string,
): StyleToCreateToken {
  // Check if the style has a bound variable for this property
  const boundVariables = style.boundVariables as Record<string, { id: string; } | undefined>;
  if (boundVariables?.[propertyKey]?.id) {
    const variable = localVariables.find((v) => v.id === boundVariables[propertyKey]?.id);
    if (variable) {
      const normalizedName = variable.name.replace(/\//g, '.');

      // First, check if there's already an existing token that matches this variable name
      if (_tokens && typeof _tokens === 'object' && 'values' in _tokens) {
        const tokenStore = _tokens as any;
        // Search through all token sets for a matching token
        for (const setName of Object.keys(tokenStore.values || {})) {
          const tokenSet = tokenStore.values[setName];
          if (Array.isArray(tokenSet)) {
            const existingToken = tokenSet.find((token: any) => (
              token.name === normalizedName && token.type === tokenType
            ));
            if (existingToken) {
              // Return the existing token
              return {
                name: existingToken.name,
                value: existingToken.value,
                type: existingToken.type,
              };
            }
          }
        }
      }

      // If no existing token found, get the variable's actual value and transform it if needed
      // Get the first available mode value
      const modeKeys = Object.keys(variable.valuesByMode || {});
      let variableValue = modeKeys.length > 0 ? variable.valuesByMode[modeKeys[0]] : undefined;

      // If no variable value found, fallback to style value
      if (variableValue === undefined || variableValue === null) {
        const styleValue = style[propertyKey as keyof TextStyle];
        variableValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);
      } else {
        // Extract the actual value from the variable object
        let actualValue: any = variableValue;

        // Handle different variable value structures
        if (typeof variableValue === 'object' && variableValue !== null) {
          const varObj = variableValue as any;

          // Check if this is a variable alias
          if (varObj.type === 'VARIABLE_ALIAS' && varObj.id) {
            // Find the referenced variable
            const referencedVariable = localVariables.find((v) => v.id === varObj.id);
            if (referencedVariable) {
              // Get the value from the referenced variable
              const refModeKeys = Object.keys(referencedVariable.valuesByMode || {});
              if (refModeKeys.length > 0) {
                const referencedValue = referencedVariable.valuesByMode[refModeKeys[0]];

                // If the referenced value is also an alias, we'll handle it recursively
                if (typeof referencedValue === 'object' && (referencedValue as any)?.type === 'VARIABLE_ALIAS') {
                  actualValue = `{${referencedVariable.name.replace(/\//g, '.')}}`;
                } else {
                  actualValue = referencedValue;
                }
              } else {
                actualValue = `{${referencedVariable.name.replace(/\//g, '.')}}`;
              }
            }

            // If referenced variable not found, fall back to the actual style value
            if (!referencedVariable) {
              // Provide appropriate fallback based on property type
              if (propertyKey === 'fontSize') {
                actualValue = style.fontSize || 16;
              } else if (propertyKey === 'lineHeight') {
                actualValue = style.lineHeight || { value: 1.2, unit: 'AUTO' };
              } else if (propertyKey === 'letterSpacing') {
                actualValue = style.letterSpacing || { value: 0, unit: 'PIXELS' };
              } else if (propertyKey === 'paragraphSpacing') {
                actualValue = style.paragraphSpacing || 0;
              } else if (propertyKey === 'fontFamily') {
                actualValue = style.fontName?.family || 'Arial';
              } else if (propertyKey === 'fontStyle') {
                actualValue = style.fontName?.style || 'Regular';
              } else {
                actualValue = 0; // Generic fallback
              }
            }
          } else if ('value' in varObj) {
            actualValue = varObj.value;
          } else if ('r' in varObj && 'g' in varObj && 'b' in varObj) {
            // This is a color object, keep as is for now
            actualValue = variableValue;
          } else if (typeof varObj === 'number') {
            // Sometimes the value itself might be the number
            actualValue = varObj;
          } else {
            // For other objects, try to find a numeric property
            const numericKeys = Object.keys(varObj).filter((key) => typeof varObj[key] === 'number');
            if (numericKeys.length > 0) {
              actualValue = varObj[numericKeys[0]];
            } else {
              // Try to extract any primitive value
              const primitiveKeys = Object.keys(varObj).filter((key) => (
                typeof varObj[key] === 'string' || typeof varObj[key] === 'number' || typeof varObj[key] === 'boolean'
              ));
              if (primitiveKeys.length > 0) {
                actualValue = varObj[primitiveKeys[0]];
              }
            }
          }
        }

        // Apply the same transformation that would be applied to the style value
        if (valueTransformer) {
          try {
            // Validate that the value is suitable for transformation
            if (actualValue === undefined || actualValue === null) {
              const styleValue = style[propertyKey as keyof TextStyle];
              variableValue = valueTransformer(styleValue);
            } else {
              variableValue = valueTransformer(actualValue);
            }
          } catch (error) {
            const styleValue = style[propertyKey as keyof TextStyle];
            variableValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);
          }
        } else {
          variableValue = String(actualValue);
        }
      }

      // Create a token with the variable's actual value
      return {
        name: normalizedName,
        value: variableValue, // Use the variable's actual value
        type: tokenType,
      };
    }
  }

  // If no variable or existing token is found, create a new token
  const styleValue = style[propertyKey as keyof TextStyle];
  const transformedValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);

  let tokenName = defaultNamePrefix;
  if (idx !== undefined) {
    if (tokenType === TokenTypes.FONT_WEIGHTS) {
      tokenName = `${defaultNamePrefix}-${idx}`;
    } else if (tokenType !== TokenTypes.FONT_FAMILIES) {
      tokenName = `${defaultNamePrefix}.${idx}`;
    }
  }

  return {
    name: tokenName,
    value: transformedValue,
    type: tokenType,
  };
}
