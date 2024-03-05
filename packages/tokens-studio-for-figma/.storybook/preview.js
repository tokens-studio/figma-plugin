import '../src/app/styles/preflight.css';
import {globalStyles} from '../src/app/components/globalStyles';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => {
    globalStyles()
    return Story()
  },
];