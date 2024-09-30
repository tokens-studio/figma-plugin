const INTER_BOLD = { family: "Inter", style: "Bold" };
figma.loadFontAsync(INTER_BOLD);
console.log(123);

figma.ui.onmessage = async (message, props) => {
  // console.log({ message, props }, '123');
  // if (props.origin !== SITE_URL) {
  //   return;
  // }
  if (message.type === 'RELOAD') {
    if (message.code) {
      eval(message.code);
    }
    return;
  }

  switch (message.type) {
    case "EVAL": {
      // const fn = eval.call(null, message.code);
      const fn = Function(`"use strict"; return ${message.code}`)();

      try {
        const result = await fn(figma, {});
        figma.ui.postMessage({
          type: "EVAL_RESULT",
          result,
          id: message.id,
        });
      } catch (e) {
        figma.ui.postMessage({
          type: "EVAL_REJECT",
          error:
            typeof e === "string"
              ? e
              : e && typeof e === "object" && "message" in e
              ? e.message
              : null,
          id: message.id,
        });
      }

      break;
    }
  }
};

// getLocalVariableCollectionsAsync

// figma.ui.onmessage = characters => {
//   if (characters === 'RELOAD') {
//     window.location.reload();
//     return;
//   }
//   if (figma.currentPage.selection.length === 0) {
//     const text = figma.createText();
//     figma.currentPage.selection = [text];
//   }

//   for (const node of figma.currentPage.selection) {
//     if (node.type === 'TEXT') {
//       node.fontName = INTER_BOLD;
//       node.characters = characters;
//     }
//   }

//   // figma.closePlugin();
// }
