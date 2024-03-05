import { Properties } from '@/constants/Properties';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

class SharedDataHandler {
  private namespace: string;

  constructor(ns: string) {
    this.namespace = ns;
  }

  keys(node: BaseNode) {
    return node.getSharedPluginDataKeys(this.namespace);
  }

  get<Result = string>(node: BaseNode, key: string, transformer?: (value: string) => Result) {
    const value = node.getSharedPluginData(this.namespace, key);
    if (value) {
      return (transformer ? transformer(value) : value) as Result;
    }
    return value;
  }

  getAll<Result = string>(node: BaseNode) {
    const keys = this.keys(node);
    const result: Record<string, Result> = {};
    keys.forEach((key) => {
      if (key in Properties) {
        const value = this.get(node, key);
        if (value) {
          try {
            // make sure we catch JSON parse errors in case invalid property keys are set and found
            // we're storing `none` as a string without quotes
            const parsedValue = value === 'none' ? 'none' : JSON.parse(value);
            result[key] = parsedValue;
          } catch (err) {
            console.warn(err);
          }
        }
      }
      return null;
    });
    return result;
  }

  set(node: BaseNode, key: string, value: string) {
    return node.setSharedPluginData(this.namespace, key, value);
  }
}

export const tokensSharedDataHandler = new SharedDataHandler(SharedPluginDataNamespaces.TOKENS);
