/* eslint-disable no-param-reassign */
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { notifyVariableValues } from './notifiers';
import { PullVariablesOptions } from '@/types';
import { VariableToCreateToken } from '@/types/payloads';
import { TokenTypes } from '@/constants/TokenTypes';

export default function pullVariables(options: PullVariablesOptions): void {
  // @TODO should be specifically typed according to their type
  const colors: VariableToCreateToken[] = [];
  const booleans: VariableToCreateToken[] = [];
  const strings: VariableToCreateToken[] = [];
  const numbers: VariableToCreateToken[] = [];
  const dimensions: VariableToCreateToken[] = [];

  figma.variables.getLocalVariables().forEach((variable) => {
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
    switch (variable.resolvedType) {
      case 'COLOR':
        Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
          const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;

          colors.push({
            name: variable.name,
            value: figmaRGBToHex(value as RGBA),
            type: TokenTypes.COLOR,
            parent: `${collection?.name}/${modeName}`,
            description: variable.description,
          });
        });
        break;
      case 'BOOLEAN':
        Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
          const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;

          booleans.push({
            name: variable.name,
            value: JSON.stringify(value),
            type: TokenTypes.BOOLEAN,
            parent: `${collection?.name}/${modeName}`,
            description: variable.description,
          });
        });
        break;
      case 'STRING':
        Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
          const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;

          strings.push({
            name: variable.name,
            value: value as string,
            type: TokenTypes.TEXT,
            parent: `${collection?.name}/${modeName}`,
            description: variable.description,
          });
        });
        break;
      case 'FLOAT':
        Object.entries(variable.valuesByMode).forEach(([mode, value]) => {
          const modeName = collection?.modes.find((m) => m.modeId === mode)?.name;
          if (options.useDimensions) {
            let tokenValue: string | number = value as number;
            if (options.useRem) {
              // TODO: get user setting for rem base
              tokenValue = `${tokenValue / 16}rem`;
            } else {
              tokenValue = `${tokenValue}px`;
            }

            dimensions.push({
              name: variable.name,
              value: tokenValue as string,
              type: TokenTypes.DIMENSION,
              parent: `${collection?.name}/${modeName}`,
              description: variable.description,
            });
          } else {
            numbers.push({
              name: variable.name,
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
