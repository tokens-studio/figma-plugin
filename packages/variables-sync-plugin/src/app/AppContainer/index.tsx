
import { Box, Button } from '@tokens-studio/ui';

import { figmaAPI } from "../lib/figmaAPI";
import GitHubSync from '../sync/GitHubSync';

function rgbToHex({ r, g, b, a }: { r: number, g: number, b: number, a: number }) {
  if (a !== 1) {
    return `rgba(${[r, g, b]
      .map((n) => Math.round(n * 255))
      .join(", ")}, ${a.toFixed(4)})`;
  }
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}`;
}

export default () => (
  <>
    <Box>
      <Button id="clickMe">Click Me – Local</Button>
      <Button id="getVariables" onClick={async () => {
        const variablesJSON = await figmaAPI.run(async (figma) => {
          const collections = await figma.variables.getLocalVariableCollectionsAsync();

          console.log({ collections });

          async function processCollection({ name, modes, variableIds }: VariableCollection) {
            const files = [];
            for (const mode of modes) {
              const file: any = { fileName: `${name}.${mode.name}.tokens.json`, body: {} };
              console.log({ variableIds })
              for (const variableId of variableIds) {
                const variable = await figma.variables.getVariableByIdAsync(variableId);

                if (variable) {
                  const { name, resolvedType, valuesByMode } = variable;

                  const value = valuesByMode[mode.modeId];
                  console.log({ value });
                  if (value !== undefined && ["COLOR", "FLOAT"].includes(resolvedType)) {
                    let obj = file.body;
                    name.split("/").forEach((groupName) => {
                      obj[groupName] = obj[groupName] || {};
                      obj = obj[groupName];
                    });
                    obj.$type = resolvedType === "COLOR" ? "color" : "number";
                    if (typeof value === 'object' && (value as VariableAlias)?.type === "VARIABLE_ALIAS") {
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
              console.log({ processedCollection })
              files.push(...processedCollection);
            } catch (err) {
              console.log({ err })
            }
          }
          return files;
        });

        // const jsonData = JSON.stringify(files, null, 2); // Pretty print with 2-space indent
        console.log(JSON.stringify({ variablesJSON }, null, 2));
      }}>Get Variables JSON</Button>
      <Button id="refreshButton">Refresh</Button>
      <GitHubSync />
    </Box>
  </>
);
