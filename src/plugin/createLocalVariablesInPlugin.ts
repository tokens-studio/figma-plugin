import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
export default async function createLocalVariablesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  themeInfo.themes.forEach((theme) => {
    const existingVariableCollections = figma.variables.getLocalVariableCollections();
    const collection = existingVariableCollections.find((vr) => vr.name === (theme.group ?? theme.name));
    if (collection) {
      const mode = collection.modes.find((m) => m.name === theme.name);
      let modeId: string = mode?.modeID ?? '';
      if (!mode) {
        modeId = collection.addMode(theme.name);
      }
      const allVariableIds = updateVariables({
        collection, mode: modeId, theme, tokens, settings,
      });
      allVariableCollectionIds[theme.id] = {
        collectionId: collection.id,
        modeId,
        variableIds: allVariableIds,
      };
    } else {
      const newCollection = figma.variables.createVariableCollection(theme.group ?? theme.name);
      newCollection.renameMode(newCollection.modes[0].modeID, theme.name);
      const allVariableIds = updateVariables({
        collection: newCollection, mode: newCollection.modes[0].modeID, theme, tokens, settings,
      });
      allVariableCollectionIds[theme.id] = {
        collectionId: newCollection.id,
        modeId: newCollection.modes[0].modeID,
        variableIds: allVariableIds,
      };
    }
  });
  return allVariableCollectionIds;
}
