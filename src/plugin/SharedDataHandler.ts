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

  set(node: BaseNode, key: string, value: string) {
    return node.setSharedPluginData(this.namespace, key, value);
  }
}

export const tokensSharedDataHandler = new SharedDataHandler(SharedPluginDataNamespaces.TOKENS);
