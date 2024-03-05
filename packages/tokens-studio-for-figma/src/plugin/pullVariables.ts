/* eslint-disable no-param-reassign */
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { notifyVariableValues } from './notifiers';
import { PullVariablesOptions } from '@/types';
import { VariableToCreateToken } from '@/types/payloads';
import { TokenTypes } from '@/constants/TokenTypes';

export default async function pullVariables(options: PullVariablesOptions): Promise<void> {
  // @TODO should be specifically typed according to their type
  const colors: VariableToCreateToken[] = [];
  const booleans: VariableToCreateToken[] = [];
  const strings: VariableToCreateToken[] = [];
  const numbers: VariableToCreateToken[] = [];
  const dimensions: VariableToCreateToken[] = [];

  let baseRem = 16;
  if (options.useRem) {
    baseRem = await figma.clientStorage.getAsync('uiSettings').then(async (uiSettings) => {
      const settings = JSON.parse(await uiSettings);
      return settings.baseFontSize;
    });
  }

  figma.variables.getLocalVariables().forEach((variable) => {
    const variableName = variable.name.replace(/\//g, '.');
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
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
              description: variable.description,
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
            description: variable.description,
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
            description: variable.description,
          });
        });
        break;
      case 'FLOAT':
        Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
          let tokenValue: string | number = value as number;
          if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
            const alias = figma.variables.getVariableById(value.id);
            tokenValue = `{${alias?.name.replace(/\//g, '.')}}`;
          } else if (options.useDimensions && options.useRem) {
            tokenValue = `${Number(tokenValue) / baseRem}rem`;
          } else {
            tokenValue = `${tokenValue}px`;
          }
          const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;

          if (options.useDimensions) {
            dimensions.push({
              name: variableName,
              value: tokenValue as string,
              type: TokenTypes.DIMENSION,
              parent: `${collection?.name}/${modeName}`,
              description: variable.description,
            });
          } else {
            numbers.push({
              name: variableName,
              value: value.toString(),
              type: TokenTypes.NUMBER,
              parent: `${collection?.name}/${modeName}`,
              description: variable.description,
            });
          }
        });
        break;
      default: return null;
    }
    return null;
  });

  const stylesObject = {
    colors,
    booleans,
    strings,
    numbers,
    dimensions,
  };

  type ResultObject = Record<string, VariableToCreateToken[]>;

  const returnedObject = Object.entries(stylesObject).reduce<ResultObject>((acc, [key, value]) => {
    if (value.length > 0) {
      acc[key] = value;
    }
    return acc;
  }, {});

  notifyVariableValues(returnedObject);
}
