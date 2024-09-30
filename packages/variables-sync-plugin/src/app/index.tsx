// const INTER_BOLD = { family: "Inter", style: "Bold" };
// figma.loadFontAsync(INTER_BOLD);
// console.log(123);
import React from "react";
import { createRoot } from "react-dom/client";

// import render from './app';

// figma.ui.onmessage = async (message, props) => {
//   // console.log({ message, props }, '123');
//   // if (props.origin !== SITE_URL) {
//   //   return;
//   // }
//   // if (message.type === 'RELOAD') {
//   //   eval(message.code);
//   //   return;
//   // }

//   switch (message.type) {
//     case "EVAL": {
//       // const fn = eval.call(null, message.code);
//       const fn = Function(`"use strict"; return ${message.code}`)();

//       try {
//         const result = await fn(figma, {});
//         figma.ui.postMessage({
//           type: "EVAL_RESULT",
//           result,
//           id: message.id,
//         });
//       } catch (e) {
//         figma.ui.postMessage({
//           type: "EVAL_REJECT",
//           error:
//             typeof e === "string"
//               ? e
//               : e && typeof e === "object" && "message" in e
//               ? e.message
//               : null,
//           id: message.id,
//         });
//       }

//       break;
//     }
//   }
// };

// app();

// // getLocalVariableCollectionsAsync

// // figma.ui.onmessage = characters => {
// //   if (characters === 'RELOAD') {
// //     window.location.reload();
// //     return;
// //   }
// //   if (figma.currentPage.selection.length === 0) {
// //     const text = figma.createText();
// //     figma.currentPage.selection = [text];
// //   }

// //   for (const node of figma.currentPage.selection) {
// //     if (node.type === 'TEXT') {
// //       node.fontName = INTER_BOLD;
// //       node.characters = characters;
// //     }
// //   }

// //   // figma.closePlugin();
// // }

class FigmaAPI {
  // private id = 0;
  id = 0;

  /**
   * Run a function in the Figma plugin context. The function cannot reference
   * any variables outside of itself, and the return value must be JSON
   * serializable. If you need to pass in variables, you can do so by passing
   * them as the second parameter.
   */
  run<T, U>(
    fn: (figma: PluginAPI, params: U) => Promise<T> | T,
    params?: U
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      const cb = (event: MessageEvent) => {
        if (
          event.origin !== "https://www.figma.com" &&
          event.origin !== "https://staging.figma.com"
        ) {
          return;
        }

        if (event.data.pluginMessage?.type === "EVAL_RESULT") {
          if (event.data.pluginMessage.id === id) {
            window.removeEventListener("message", cb);
            resolve(event.data.pluginMessage.result);
          }
        }

        if (event.data.pluginMessage?.type === "EVAL_REJECT") {
          if (event.data.pluginMessage.id === id) {
            window.removeEventListener("message", cb);
            const message = event.data.pluginMessage.error;
            reject(
              new Error(
                typeof message === "string"
                  ? message
                  : "An error occurred in FigmaAPI.run()"
              )
            );
          }
        }
      };
      window.addEventListener("message", cb);

      const msg = {
        pluginMessage: {
          type: "EVAL",
          code: fn.toString(),
          id,
          params,
        },
        pluginId: "*",
      };

      ["https://www.figma.com", "https://staging.figma.com"].forEach(
        (origin) => {
          try {
            parent.postMessage(msg, origin);
          } catch {}
        }
      );
    });
  }
}

const figmaAPI = new FigmaAPI();

function postMessage(pluginMessage: any) {
  parent.postMessage({ pluginMessage, pluginId: "*" }, "*");
}

// (async () => {

//   try {
//     // Bootload code
//     await fetch('./code.js?nocache=' + (new Date()).getTime())
//       .then(response => response.text())
//       .then(code => postMessage(code));
//   } catch (err) {
//     // Silent fail, since we're assuming the remote code.js isn't available and the plugin is falling back to the local build
//   }

//   // Setup event handlers
//   document.querySelector('#clickMe').onclick = async () => {
//     const text = 'Hello, World!';

//     // postMessage('Hello Config!');
//     const success = await figmaAPI.run(async (figma) => {
//       const characters = 'Hello, World!';
//       const INTER_BOLD = { family: "Inter", style: "Bold" };

//       if (figma.currentPage.selection.length === 0) {
//         const text = figma.createText();
//         figma.currentPage.selection = [text];
//       }

//       for (const node of figma.currentPage.selection) {
//         if (node.type === 'TEXT') {
//           node.fontName = INTER_BOLD;
//           node.characters = characters;
//         }
//       }
//       //   // if (figma.currentPage.selection.length === 0) {
//       //     // const text = figma.createText();
//       //     // figma.currentPage.selection = [text];
//       //   //   console.log('createText()')
//       //   // }
//       // figma.notify(
//       //   "Please select a layer with text in it to generate a poem. 123",
//       //   { error: true },
//       // );
//       return true;
//     });
//     console.log({ success })
//   }

//   document.querySelector('#getVariables').onclick = async () => {
//     const variablesJSON = await figmaAPI.run(async (figma) => {
//       function rgbToHex({ r, g, b, a }) {
//         if (a !== 1) {
//           return `rgba(${[r, g, b]
//             .map((n) => Math.round(n * 255))
//             .join(", ")}, ${a.toFixed(4)})`;
//         }
//         const toHex = (value) => {
//           const hex = Math.round(value * 255).toString(16);
//           return hex.length === 1 ? "0" + hex : hex;
//         };

//         const hex = [toHex(r), toHex(g), toHex(b)].join("");
//         return `#${hex}`;
//       }
//       const collections = await figma.variables.getLocalVariableCollectionsAsync();

//       async function processCollection({ name, modes, variableIds }) {
//         const files = [];
//         for (const mode of modes) {
//           const file = { fileName: `${name}.${mode.name}.tokens.json`, body: {} };
//           for (const variableId of variableIds) {
//             const { name, resolvedType, valuesByMode } =
//               await figma.variables.getVariableByIdAsync(variableId);
//             const value = valuesByMode[mode.modeId];
//             if (value !== undefined && ["COLOR", "FLOAT"].includes(resolvedType)) {
//               let obj = file.body;
//               name.split("/").forEach((groupName) => {
//                 obj[groupName] = obj[groupName] || {};
//                 obj = obj[groupName];
//               });
//               obj.$type = resolvedType === "COLOR" ? "color" : "number";
//               if (value.type === "VARIABLE_ALIAS") {
//                 const currentVar = await figma.variables.getVariableByIdAsync(
//                   value.id
//                 );
//                 obj.$value = `{${currentVar.name.replace(/\//g, ".")}}`;
//               } else {
//                 obj.$value = resolvedType === "COLOR" ? rgbToHex(value) : value;
//               }
//             }
//           }
//           files.push(file);
//         }
//         return files;
//       }

//       const files = [];
//       for (const collection of collections) {
//         try {
//           files.push(...(await processCollection(collection)));
//         } catch (err) {
//           console.log({ err })
//         }
//       }
//       // let allVariables = [];

//       // // Loop through each collection and fetch variables
//       // for (const collection of variableCollections) {
//       //   const variablesInCollection = figma.variables.getVariablesById(collection.id);

//       //   // Format variables for JSON
//       //   const formattedCollection = {
//       //     id: collection.id,
//       //     name: collection.name,
//       //     description: collection.description,
//       //     variables: variablesInCollection.map((variable) => ({
//       //       id: variable.id,
//       //       name: variable.name,
//       //       type: variable.type,
//       //       resolvedValue: variable.getValueForMode("default") // Get value for default mode (or other modes if needed)
//       //     })),
//       //   };

//       //   allVariables.push(formattedCollection);
//       // }

//       // Prepare the data as JSON string
//       return files;
//     });
//     // const jsonData = JSON.stringify(files, null, 2); // Pretty print with 2-space indent
//     console.log(JSON.stringify(variablesJSON, null, 2));
//   }
//   document.querySelector('#refreshButton').onclick = async () => {
//     // postMessage('RELOAD');
//     await fetch('./code.js?nocache=' + (new Date()).getTime())
//     .then(response => response.text())
//     .then(code => postMessage({ type: 'RELOAD', code }));

//     window.location = 'http://127.0.0.1:8080/webpage/ui.html?nocache=' + (new Date()).getTime();
//   }
// })()

async function bootstrap() {
  try {
    // Bootload code
    await fetch("./code.js?nocache=" + new Date().getTime())
      .then((response) => response.text())
      .then((code) => postMessage(code));
  } catch (err) {
    // Silent fail, since we're assuming the remote code.js isn't available and the plugin is falling back to the local build
  }

  const App = (await import("./components/App.js")).default;

  const container = document.getElementById("app");

  const root = createRoot(container!);
  root.render(<App />);
}

bootstrap();
