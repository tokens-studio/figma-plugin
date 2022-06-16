import { tokensSharedDataHandler } from '../SharedDataHandler';

export function setStyleIdBackup(node: BaseNode, styleId: string, backupKey: string) {
  // Setting to empty string will delete the plugin data key if the style id doesn't exist:
  tokensSharedDataHandler.set(node, backupKey, styleId ? JSON.stringify(styleId) : '');
}
