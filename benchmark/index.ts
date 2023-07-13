/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import parseTokenValues from '../src/utils/parseTokenValues';
import { TokenTypes } from '../src/constants/TokenTypes';
import { resolveTokenValues } from '../src/plugin/tokenHelpers';
import defaultTokens from './mocks/defaultTokens';

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




const parsedTokens = parseTokenValues(defaultTokens);

const resolved = resolveTokenValues(parsedTokens.global, 0)

