/* eslint-disable no-param-reassign */
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { notifyVariableValues } from './notifiers';
import { PullVariablesOptions, ThemeObjectsList } from '@/types';
import { VariableToCreateToken } from '@/types/payloads';
import { TokenTypes } from '@/constants/TokenTypes';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export default async function pullVariables(options: PullVariablesOptions, themes: ThemeObjectsList, proUser: boolean): Promise<void> {
  // @TODO should be specifically typed according to their type
  const colors: VariableToCreateToken[] = [];
  const booleans: VariableToCreateToken[] = [];
  const strings: VariableToCreateToken[] = [];
  const numbers: VariableToCreateToken[] = [];
  const dimensions: VariableToCreateToken[] = [];

  let baseRem = 16;
  if (options.useRem) {
    const uiSettings = await figma.clientStorage.getAsync('uiSettings');
    const settings = JSON.parse(await uiSettings);
    if (settings?.baseFontSize) {
      const baseFontSizeValue = typeof settings.baseFontSize === 'number'
        ? settings.baseFontSize
        : parseFloat(settings.baseFontSize);

      baseRem = !isNaN(baseFontSizeValue) ? Number(baseFontSizeValue) : 16;
    }
  }

  const localVariables = await getVariablesWithoutZombies();

  const collections = new Map<string, {
    id: string,
    name: string,
    modes: { name: string, modeId: string }[]
  }>();

  for (const variable of localVariables) {
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
    if (collection) {
      collections.set(collection.name, {
        id: collection.id,
        name: collection.name,
        modes: collection.modes.map((mode) => ({ name: mode.name, modeId: mode.modeId })),
      });
    }
    const variableName = variable.name.replace(/\//g, '.');
    try {
      switch (variable.resolvedType) {
        case 'COLOR':
          Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
            let tokenValue;

            if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
              const alias = figma.variables.getVariableById(value.id);
              tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
            } else {
              tokenValue = figmaRGBToHex(value as RGBA);
            }

            const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;
            if (tokenValue) {
              colors.push({
                name: variableName,
                value: tokenValue as string,
                type: TokenTypes.COLOR,
                parent: `${collection?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
              });
            }
          });
          break;
        case 'BOOLEAN':
          Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
            const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;
            let tokenValue;
            if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
              const alias = figma.variables.getVariableById(value.id);
              tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
            } else {
              tokenValue = JSON.stringify(value);
            }

            booleans.push({
              name: variableName,
              value: tokenValue,
              type: TokenTypes.BOOLEAN,
              parent: `${collection?.name}/${modeName}`,
              ...(variable.description ? { description: variable.description } : {}),
            });
          });
          break;
        case 'STRING':
          Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
            const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;
            let tokenValue;
            if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
              const alias = figma.variables.getVariableById(value.id);
              tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
            } else {
              tokenValue = value;
            }

            strings.push({
              name: variableName,
              value: tokenValue as string,
              type: TokenTypes.TEXT,
              parent: `${collection?.name}/${modeName}`,
              ...(variable.description ? { description: variable.description } : {}),
            });
          });
          break;
        case 'FLOAT':
          Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
            let tokenValue: string | number = value as number;
            if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
              const alias = figma.variables.getVariableById(value.id);
              tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
            } else if (typeof value === 'number') {
              if (options.useRem) {
                tokenValue = `${Number((Number(tokenValue) / parseFloat(String(baseRem))).toFixed(3))}rem`;
              } else if (options.useDimensions) {
                tokenValue = `${Number(tokenValue.toFixed(3))}px`;
              } else {
                tokenValue = Number(tokenValue.toFixed(3));
              }
            }
            const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;

            if (options.useDimensions || options.useRem) {
              dimensions.push({
                name: variableName,
                value: tokenValue as string,
                type: TokenTypes.DIMENSION,
                parent: `${collection?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
              });
            } else {
              numbers.push({
                name: variableName,
                value: tokenValue as string,
                type: TokenTypes.NUMBER,
                parent: `${collection?.name}/${modeName}`,
                ...(variable.description ? { description: variable.description } : {}),
              });
            }
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error while processing variable:', variableName, error);
    }
  }

  const stylesObject = {
    colors,
    booleans,
    strings,
    numbers,
    dimensions,
  };

  type ResultObject = Record<string, VariableToCreateToken[]>;

  const themesToCreate: ThemeObjectsList = [];
  // Process themes if pro user
  if (proUser) {
    await Promise.all(Array.from(collections.values()).map(async (collection) => {
      await Promise.all(collection.modes.map(async (mode) => {
        themesToCreate.push({
          id: `${collection.name.toLowerCase()}-${mode.name.toLowerCase()}`,
          name: mode.name,
          group: collection.name,
          selectedTokenSets: {
            [`${collection.name}/${mode.name}`]: TokenSetStatus.ENABLED,
          },
          $figmaStyleReferences: {},
          $figmaVariableReferences: {},
          $figmaModeId: mode.modeId,
          $figmaCollectionId: collection.id,
        });
      }));
    }));
  }

  try {
    const processedTokens = Object.entries(stylesObject).reduce<ResultObject>((acc, [key, value]) => {
      if (value.length > 0) {
        acc[key] = value;
      }
      return acc;
    }, {});
    notifyVariableValues(processedTokens, themesToCreate);
  } catch (error) {
    console.error('Error processing results:', error);
    notifyVariableValues({});
  }
}
