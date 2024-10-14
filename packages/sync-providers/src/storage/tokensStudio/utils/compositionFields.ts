import { Properties } from '@tokens-studio/types';

export const INVALID_COMPOSITION_PROPERTIES = [
  Properties.composition,
  Properties.description,
  Properties.value,
  Properties.tokenName,
  Properties.tokenValue,
];

// Function to generate the fields for the composition type
export const generateCompositionFields = (properties: typeof Properties): string => {
  const fields = Object.values(properties)
    .filter((prop) => !INVALID_COMPOSITION_PROPERTIES.includes(prop as Properties))
    .join('\n');
  return fields;
};

// Generate the composition fields
export const compositionFields = generateCompositionFields(Properties);
