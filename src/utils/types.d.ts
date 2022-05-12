export interface TransformerOptions {
  expandTypography: boolean;
  expandShadow: boolean;
  preserveRawValue: boolean;
  throwErrorWhenNotResolved?: boolean;
  resolveReferences: boolean | 'math';
}
