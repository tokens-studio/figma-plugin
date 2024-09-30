// @ts-nocheck
import { GithubTokenStorage } from "@tokens-studio/sync-providers";
import { StorageTypeCredentials } from "@tokens-studio/sync-providers/types";
import { Button } from "@tokens-studio/ui";
import { useCallback, useState } from "react";
import { figmaAPI } from "../lib/figmaAPI";

type GithubCredentials = Extract<
  StorageTypeCredentials,
  { provider: StorageProviderType.GITHUB }
>;

export default () => {
  const [variables, setVariables] = useState([]);
  const storageClientFactory = useCallback(
    (context: GithubCredentials, owner?: string, repo?: string) => {
      const splitContextId = context.id.split("/");
      const storageClient = new GithubTokenStorage(
        context.secret,
        owner ?? splitContextId[0],
        repo ?? splitContextId[1],
        context.baseUrl ?? ""
      );

      if (context.filePath) storageClient.changePath(context.filePath);
      if (context.branch) storageClient.selectBranch(context.branch);
      storageClient.enableMultiFile();
      // if (isProUser) storageClient.enableMultiFile();

      return storageClient;
    },
    []
  );

  const getVariables = useCallback(async () => {
    const variablesJSON = await figmaAPI.run(async (figma) => {
      const collections =
        await figma.variables.getLocalVariableCollectionsAsync();

      // console.log({ collections });

      async function processCollection({
        name,
        modes,
        variableIds,
      }: VariableCollection) {
        const files = [];
        for (const mode of modes) {
          const file: any = {
            fileName: `${name}.${mode.name}.tokens.json`,
            body: {},
          };
          // console.log({ variableIds });
          for (const variableId of variableIds) {
            const variable = await figma.variables.getVariableByIdAsync(
              variableId
            );

            if (variable) {
              const { name, resolvedType, valuesByMode } = variable;

              const value = valuesByMode[mode.modeId];

              if (
                value !== undefined &&
                ["COLOR", "FLOAT"].includes(resolvedType)
              ) {
                let obj = file.body;
                name.split("/").forEach((groupName) => {
                  obj[groupName] = obj[groupName] || {};
                  obj = obj[groupName];
                });
                obj.$type = resolvedType === "COLOR" ? "color" : "number";
                if (
                  typeof value === "object" &&
                  (value as VariableAlias)?.type === "VARIABLE_ALIAS"
                ) {
                  const currentVar = await figma.variables.getVariableByIdAsync(
                    (value as VariableAlias).id
                  );
                  if (currentVar) {
                    obj.$value = `{${currentVar.name.replace(/\//g, ".")}}`;
                  }
                } else {
                  obj.$value = value;
                  // obj.$value = resolvedType === "COLOR" ? rgbToHex(value) : value;
                }
              }
            }
          }
          files.push(file);
        }
        return files;
      }

      const files = [];
      for (const collection of collections) {
        try {
          const processedCollection = await processCollection(collection);
          console.log({ processedCollection });
          files.push(...processedCollection);
        } catch (err) {
          console.log({ err });
        }
      }
      return files;
    });

    return variablesJSON;
  });

  const pushTokensToGitHub = useCallback(
    async (
      variables,
      context: GithubCredentials,
      overrides?: PushOverrides
    ): Promise<RemoteResponseData> => {
      const storage = storageClientFactory({
        id: "user/repo",
        secret: "github_key",
        branch: "branchname",
        filePath: "variables",
      });

      const files = variables?.map(({ fileName, body }) => ({
        type: "tokenSet",
        name: fileName.replace(".json", "").split(".").join("/"),
        path: fileName,
        data: body,
      }));
      console.log(JSON.stringify({ files }, null, 2));
      if (files.length > 0) {
        storage.write(files, { commitMessage: "test" });
      }
    }
  );
  // if (dispatch) {
  //   dispatch.uiState.setLocalApiState({ ...context });
  // }

  return (
    <>
      {/* <Button onClick={async () => {}}>Get Variables</Button> */}
      <Button
        onClick={async () => {
          const variablesJSON = await getVariables();
          await pushTokensToGitHub(variablesJSON);
        }}
      >
        Push Variables to GitHub
      </Button>
    </>
  );
};
