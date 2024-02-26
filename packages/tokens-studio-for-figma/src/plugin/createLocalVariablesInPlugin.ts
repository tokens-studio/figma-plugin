import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import createVariableMode from './createVariableMode';
import { notifyUI } from './notifiers';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
export default async function createLocalVariablesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState) {
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  let create = 0;
  console.log('figma variables before: ', figma.variables.getLocalVariables());
  themeInfo.themes.forEach((theme) => {
    const collection = figma.variables.getLocalVariableCollections().find((vr) => vr.name === (theme.group ?? theme.name));
    if (collection) {
      const mode = collection.modes.find((m) => m.name === theme.name);
      const modeId: string = mode?.modeId ?? createVariableMode(collection, theme.name);
      if (modeId) {
        console.log('11111111111111111111');
        const allVariableObj = updateVariables({
          collection, mode: modeId, theme, tokens, settings,
        });
        allVariableCollectionIds[theme.id] = {
          collectionId: collection.id,
          modeId,
          variableIds: allVariableObj.variableIds,
        };
        referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
      }
    } else {
      const newCollection = figma.variables.createVariableCollection(theme.group ?? theme.name);
      newCollection.renameMode(newCollection.modes[0].modeId, theme.name);
      console.log('22222222222222222222');
      const allVariableObj = updateVariables({
        collection: newCollection, mode: newCollection.modes[0].modeId, theme, tokens, settings,
      });
      allVariableCollectionIds[theme.id] = {
        collectionId: newCollection.id,
        modeId: newCollection.modes[0].modeId,
        variableIds: allVariableObj.variableIds,
      };
      referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
    }
  });
  console.log('referenceVariableCandidates: ', referenceVariableCandidates);
  const figmaVariables = figma.variables.getLocalVariables();
  console.log('figmaVariables: ', figmaVariables);
  updateVariablesToReference(figmaVariables, referenceVariableCandidates);
  if (figmaVariables.length === 0) {
    notifyUI('No variables were created');
  } else {
    notifyUI(`${figma.variables.getLocalVariableCollections().length} collections and ${figmaVariables.length} variables created`);
  }
  console.log('allVariablesCollectionIds: ', allVariableCollectionIds);
  return {
    allVariableCollectionIds,
    totalVariables: figmaVariables.length,
  };
}
