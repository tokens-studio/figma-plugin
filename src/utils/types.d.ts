export interface TransformerOptions {
  expandTypography: boolean;
  expandShadow: boolean;
  expandComposition: boolean;
  preserveRawValue: boolean;
  throwErrorWhenNotResolved?: boolean;
  resolveReferences: boolean | 'math';
}
