figma.showUI(
  `<script>
    window.location = 'http://127.0.0.1:8080/webpage/ui.html?nocache=' + (new Date()).getTime();
  </script>`
);

figma.ui.onmessage = (code) => {
  // console.log({ code });
  // if (code === 'RELOAD') {
  //   figma.showUI(
  //     `<script>
  //       window.location = 'http://127.0.0.1:8080/webpage/ui.html?nocache=' + (new Date()).getTime();;
  //     </script>`
  //   );
  //   return;
  // }
  eval(code);
}

// figma.ui.onmessage = async (message, props) => {
//   if (props.origin !== SITE_URL) {
//     return;
//   }

//   switch (message.type) {
//     case "EVAL": {
//       const fn = eval.call(null, message.code);

//       try {
//         const result = await fn(figma, message.params);
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
