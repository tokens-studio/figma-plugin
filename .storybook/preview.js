import '../src/app/styles/main.css';
import '../src/app/styles/figma.css';
import '../src/app/styles/preflight.css';
import '../src/app/styles/figma-bridge.css';
import '../src/app/styles/vendor.css';
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}