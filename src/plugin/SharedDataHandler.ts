import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

class SharedDataHandler {
  private namespace: string;

  constructor(ns: string) {
    this.namespace = ns;
  }

  get(node: BaseNode, key: string) {
    return node.getSharedPluginData(this.namespace, key);
  }

  set(node: BaseNode, key: string, value: string) {
    return node.setSharedPluginData(this.namespace, key, value);
  }
}

export const tokensSharedDataHandler = new SharedDataHandler(SharedPluginDataNamespaces.TOKENS);
