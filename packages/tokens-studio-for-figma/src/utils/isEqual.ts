/* eslint-disable eqeqeq */
/* eslint-disable no-self-compare */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-use-before-define */

// @README adjusted from just-compare
// https://github.com/angus-c/just/blob/master/LICENSE

export function isEqual(value1: any, value2: any): boolean {
  if (value1 === value2) {
    return true;
  }

  // if both values are NaNs return true
  if (value1 !== value1 && value2 !== value2) {
    return true;
  }

  if (
    typeof value1 !== typeof value2 // primitive != primitive wrapper
    || {}.toString.call(value1) != {}.toString.call(value2) // check for other (maybe nullish) objects
  ) {
    return false;
  }

  if (value1 !== Object(value1)) {
    // non equal primitives
    return false;
  }

  if (!value1) {
    return false;
  }

  if (Array.isArray(value1)) {
    return compareArrays(value1, value2);
  }

  if ({}.toString.call(value1) == '[object Set]') {
    return compareArrays(Array.from(value1), Array.from(value2));
  }

  if ({}.toString.call(value1) == '[object Object]') {
    return compareObjects(value1, value2);
  }

  return compareNativeSubtypes(value1, value2);
}

function compareNativeSubtypes(value1: any, value2: any) {
  // e.g. Function, RegExp, Date
  return value1.toString() === value2.toString();
}

function compareArrays(value1: any[], value2: any[]) {
  const len = value1.length;

  if (len != value2.length) {
    return false;
  }

  for (let i = 0; i < len; i += 1) {
    if (!isEqual(value1[i], value2[i])) {
      return false;
    }
  }

  return true;
}

// @README the only difference can be found here
// the compareObjects function will also check the order of keys
// this is important because the token sorting works based on the order of keys
function compareObjects(value1: any, value2: any) {
  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);
  const len = keys1.length;

  if (len != Object.keys(value2).length) {
    return false;
  }

  for (let i = 0; i < len; i += 1) {
    const key1 = keys1[i];

    if (
      !(
        value2.hasOwnProperty(key1)
        && key1 === keys2[i]
        && isEqual(value1[key1], value2[key1])
      )
    ) {
      return false;
    }
  }

  return true;
}
