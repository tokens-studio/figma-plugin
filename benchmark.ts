/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import parseTokenValues from './src/utils/parseTokenValues';
import { TokenTypes } from './src/constants/TokenTypes';
import { resolveTokenValues } from './src/plugin/tokenHelpers';
import { parse } from '@babel/core';

const createDeepTokens = (depth: number) => {
  const obj: any = {
    "referenced": {}
  };
 

  obj.referenced = { value: `{${new Array(depth).fill('nest', 0, depth).join('.')}}`, type: 'other' };
 
  let currentObject = obj;
  for (let i = 1; i <= depth; i++) {
    const key = 'nest';
    currentObject[key] = {};
    currentObject = currentObject[key];
    if (i === depth) {
      currentObject[key] = { value: '10px', type: 'dimension' };
    }
  }

  return obj;
};

//const tokens = createDeepTokens(5);
const tokens = [
  { name: 'foo', value: 3 },
  { name: 'bar', value: '{foo}' },
  { name: 'boo', value: '{baz}' },
  { name: 'math', value: '{foo} * 2' },
  { name: 'mathWrong', value: '{foo} * {boo}' },
  { name: 'colors.red.500', value: '#ff0000' },
  { name: 'opacity.default', value: '0.2 + 0.2' },
  { name: 'opacity.full', value: '{opacity.default} + 0.6' },
  { name: 'theme.accent.default', value: 'rgba({colors.red.500}, 0.5)' },
  { name: 'theme.accent.subtle', value: 'rgba({colors.red.500}, {opacity.default})' },
  { name: 'theme.accent.deep', value: 'rgba({theme.accent.default}, {opacity.full})' },
  { name: 'spacing.xs', value: '{spacing.xs}' },
  { name: 'opacity.40', value: '40%' },
  { name: 'border-radius.7', value: '24px' },
  {
    name: 'composition.single',
    type: 'composition',
    value: {
      opacity: '{opacity.40}',
    },
  },
  {
    name: 'composition.multiple',
    type: 'composition',
    value: {
      opacity: '{opacity.40}',
      borderRadius: '{border-radius.7}',
    },
  },
  {
    name: 'composition.alias',
    type: 'composition',
    value: {
      fill: '{colors.red.500}',
    },
  },
  { name: 'size.25', value: '2px' },
   {
    name: 'shadow.shadowAlias',
    value: '{shadow.single}',
    description: 'the one with a nested shadow alias',
    type: TokenTypes.BOX_SHADOW,
  },
  {
    name: 'colors.modify',
    value: '#00a2ba',
    $extensions: {
      'studio.tokens': {
        modify: {
          type: 'darken',
          value: '0.3',
          space: 'srgb',
        },
      },
    },
    description: 'color with modifier',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.white',
    value: '#00a2ba',
    description: 'color with modifier',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.alias-modify',
    value: '$colors.white',
    $extensions: {
      'studio.tokens': {
        modify: {
          type: 'darken',
          value: '0.3',
          space: 'srgb',
        },
      },
    },
    description: 'color with alias modifier',
    type: TokenTypes.COLOR,
  },
];



//const deepTokens = createDeepTokens(5);

const parsedTokens = parseTokenValues(tokens);

//console.log(deepTokens)
console.log(parsedTokens)


  let resolved = resolveTokenValues(parsedTokens.global, 0)
  console.log(resolved)

