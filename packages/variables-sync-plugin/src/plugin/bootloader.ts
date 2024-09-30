async function checkUrlExists(url: string) { 
  try {
    const response = await fetch(url);
    console.log({ response });
    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.log({ error });
    return false;
  }
}

async function bootstrap() {
  const exists = await checkUrlExists('http://127.0.0.1:8080/webpage/ui.html?nocache=' + (new Date()).getTime());
  
  console.log({ exists });
  // FIXME: Get this working
  if (exists) {
    figma.showUI(
      `<script>
        window.location = 'http://127.0.0.1:8080/webpage/ui.html?nocache=' + (new Date()).getTime();
      </script>`,
      { themeColors: true }
    );
    figma.ui.onmessage = (code) => {
      eval(code);
    }

  } else {
    figma.showUI(__html__, { themeColors: true, width: 400, height: 400 });

    figma.loadFontAsync({ family: "Inter", style: "Bold" });
    console.log(123);

    figma.ui.onmessage = async (message, props) => {
      // console.log({ message, props }, '123');
      // if (props.origin !== SITE_URL) {
      //   return;
      // }
      // if (message.type === 'RELOAD') {
      //   eval(message.code);
      //   return;
      // }

      switch (message.type) {
        case "EVAL": {
          // const fn = eval.call(null, message.code);
          const fn = Function(`"use strict"; return ${message.code}`)();

          try {
            const result = await fn(figma, message.params);
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
  }
}


bootstrap();

// figma.showUI(
//   `<script>
//     window.location = 'http://127.0.0.1:8080/webpage/ui.html?nocache=' + (new Date()).getTime();
//   </script>`
// );

