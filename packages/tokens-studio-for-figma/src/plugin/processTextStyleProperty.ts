import { TokenTypes } from '@/constants/TokenTypes';
import { StyleToCreateToken } from '@/types/payloads';
import { SingleToken } from '@/types/tokens';

export function processTextStyleProperty(
  style: TextStyle,
  propertyKey: string,
  localVariables: Variable[],
  tokens: any,
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

      // Get the variable's actual value and transform it if needed
      console.log(`Processing variable ${normalizedName} for property ${propertyKey}`);
      console.log('Variable object:', JSON.stringify(variable, null, 2));
      console.log('Variable valuesByMode:', JSON.stringify(variable.valuesByMode, null, 2));

      // Get the first available mode value
      const modeKeys = Object.keys(variable.valuesByMode || {});
      let variableValue = modeKeys.length > 0 ? variable.valuesByMode[modeKeys[0]] : undefined;

      console.log(`Available modes: ${modeKeys.join(', ')}`);
      console.log(`Variable value for mode ${modeKeys[0]}:`, JSON.stringify(variableValue, null, 2));
      console.log('Variable type:', variable.resolvedType);
      console.log('Variable value type:', typeof variableValue);
      console.log('Variable value constructor:', variableValue?.constructor?.name);

      // If no variable value found, fallback to style value
      if (variableValue === undefined || variableValue === null) {
        console.log('Variable value not found, using style value as fallback');
        const styleValue = style[propertyKey as keyof TextStyle];
        variableValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);
      } else {
        // Extract the actual value from the variable object
        let actualValue: any = variableValue;

        // Handle different variable value structures
        if (typeof variableValue === 'object' && variableValue !== null) {
          console.log('Variable value is an object, extracting actual value');
          const varObj = variableValue as any;

          // Check if this is a variable alias
          if (varObj.type === 'VARIABLE_ALIAS' && varObj.id) {
            console.log('Found variable alias, resolving referenced variable:', varObj.id);
            // Find the referenced variable
            const referencedVariable = localVariables.find((v) => v.id === varObj.id);
            if (referencedVariable) {
              console.log('Found referenced variable:', referencedVariable.name);
              // Get the value from the referenced variable
              const refModeKeys = Object.keys(referencedVariable.valuesByMode || {});
              if (refModeKeys.length > 0) {
                const referencedValue = referencedVariable.valuesByMode[refModeKeys[0]];
                console.log('Referenced variable value:', referencedValue);

                // If the referenced value is also an alias, we'll handle it recursively
                if (typeof referencedValue === 'object' && (referencedValue as any)?.type === 'VARIABLE_ALIAS') {
                  console.log('Referenced variable is also an alias, using variable name as reference');
                  actualValue = `{${referencedVariable.name.replace(/\//g, '.')}}`;
                } else {
                  console.log('Using referenced variable value directly:', referencedValue);
                  actualValue = referencedValue;
                }
              } else {
                console.log('Referenced variable has no modes, using variable name as reference');
                actualValue = `{${referencedVariable.name.replace(/\//g, '.')}}`;
              }
            } else {
              console.log('Referenced variable not found, falling back to style value');
              // Instead of using the variable ID, fall back to the actual style value
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
            console.log('Found .value property:', varObj.value);
            actualValue = varObj.value;
          } else if ('r' in varObj && 'g' in varObj && 'b' in varObj) {
            // This is a color object, keep as is for now
            console.log('Found color object');
            actualValue = variableValue;
          } else if (typeof varObj === 'number') {
            // Sometimes the value itself might be the number
            console.log('Variable value is directly a number');
            actualValue = varObj;
          } else {
            // For other objects, try to find a numeric property
            console.log('Searching for numeric properties in object');
            const numericKeys = Object.keys(varObj).filter((key) => typeof varObj[key] === 'number');
            console.log('Found numeric keys:', numericKeys);
            if (numericKeys.length > 0) {
              actualValue = varObj[numericKeys[0]];
              console.log(`Using value from key '${numericKeys[0]}':`, actualValue);
            } else {
              // Try to extract any primitive value
              const primitiveKeys = Object.keys(varObj).filter((key) =>
                typeof varObj[key] === 'string' || typeof varObj[key] === 'number' || typeof varObj[key] === 'boolean'
              );
              console.log('Found primitive keys:', primitiveKeys);
              if (primitiveKeys.length > 0) {
                actualValue = varObj[primitiveKeys[0]];
                console.log(`Using primitive value from key '${primitiveKeys[0]}':`, actualValue);
              }
            }
          }
          console.log('Extracted actual value:', actualValue);
        }

        // Apply the same transformation that would be applied to the style value
        if (valueTransformer) {
          console.log('Applying value transformer to actual value');
          try {
            // Validate that the value is suitable for transformation
            if (actualValue === undefined || actualValue === null) {
              console.log('Actual value is undefined/null, using fallback');
              const styleValue = style[propertyKey as keyof TextStyle];
              variableValue = valueTransformer(styleValue);
            } else {
              variableValue = valueTransformer(actualValue);
            }
          } catch (error) {
            console.error('Error applying value transformer:', error);
            console.log('Falling back to style value');
            const styleValue = style[propertyKey as keyof TextStyle];
            variableValue = valueTransformer ? valueTransformer(styleValue) : String(styleValue);
          }
        } else {
          variableValue = String(actualValue);
        }
      }

      console.log('Final variable value:', variableValue);

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
