export interface TransformerOptions {
  expandTypography: boolean;
  expandShadow: boolean;
  expandComposition: boolean;
  expandBorder: boolean;
  preserveRawValue: boolean;
  throwErrorWhenNotResolved?: boolean;
  resolveReferences: boolean | 'math';
}
