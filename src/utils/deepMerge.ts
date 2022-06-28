/* ts-deep-merge, unlicensed, https://github.com/voodoocreation/ts-deepmerge/blob/master/src/index.ts */
interface IObject {
  [key: string]: any;
  length?: never;
}

type TUnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

const isObject = (obj: any) => {
  if (typeof obj === 'object' && obj !== null) {
    if (typeof Object.getPrototypeOf === 'function') {
      const prototype = Object.getPrototypeOf(obj);
      return prototype === Object.prototype || prototype === null;
    }

    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  return false;
};

const deepMerge = <T extends IObject[]>(...objects: T): TUnionToIntersection<T[number]> => objects.reduce((result, current) => {
  Object.keys(current).forEach((key) => {
    if (Array.isArray(result[key]) && Array.isArray(current[key])) {
      result[key] = deepMerge.options.mergeArrays
        ? Array.from(new Set((result[key] as unknown[]).concat(current[key])))
        : current[key];
    } else if (isObject(result[key]) && isObject(current[key])) {
      result[key] = deepMerge(result[key] as IObject, current[key] as IObject);
    } else {
      result[key] = current[key];
    }
  });

  return result;
}, {}) as any;

interface IOptions {
  mergeArrays: boolean;
}

const defaultOptions: IOptions = {
  mergeArrays: true,
};

deepMerge.options = defaultOptions;

deepMerge.withOptions = <T extends IObject[]>(options: Partial<IOptions>, ...objects: T) => {
  deepMerge.options = {
    mergeArrays: true,
    ...options,
  };

  const result = deepMerge(...objects);

  deepMerge.options = defaultOptions;

  return result;
};

export default deepMerge;
