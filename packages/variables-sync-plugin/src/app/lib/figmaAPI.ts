class FigmaAPI {
  private id = 0;

  /**
   * Run a function in the Figma plugin context. The function cannot reference
   * any variables outside of itself, and the return value must be JSON
   * serializable. If you need to pass in variables, you can do so by passing
   * them as the second parameter.
   */
  run<T, U>(
    fn: (figma: PluginAPI, params: U) => Promise<T> | T,
    params?: U,
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
                  : "An error occurred in FigmaAPI.run()",
              ),
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
        },
      );
    });
  }
}

export const figmaAPI = new FigmaAPI();
