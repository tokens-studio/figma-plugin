/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import parseTokenValues from './src/utils/parseTokenValues';

const createDeepTokens = (depth: number) => {
  const obj: any = {
    nestedReference: {},
  };

  obj.nestedReference = { value: `{${new Array(depth).fill('nest', 0, depth).join('.')}}`, type: 'other' };

  let currentObject = obj;
  for (let i = 1; i <= depth; i++) {
    const key = 'nest';
    currentObject[key] = {};
    currentObject = currentObject[key];
    if (i === depth) {
      currentObject[key] = { value: 'hello', type: 'other' };
    }
  }

  return obj;
};

const tokens = parseTokenValues(createDeepTokens(5));

console.log(tokens);
