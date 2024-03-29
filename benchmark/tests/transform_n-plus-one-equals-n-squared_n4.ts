import transform from '../../src/utils/transform';
import tokens from '../mocks/n-plus-one-equals-n-squared_n4.json';

// @ts-ignore
transform({ core: tokens }, ['core'], [], {
  expandTypography: true,
  expandShadow: false,
  expandComposition: true,
  preserveRawValue: false,
  throwErrorWhenNotResolved: false,
  resolveReferences: true,
  expandBorder: false,
});
