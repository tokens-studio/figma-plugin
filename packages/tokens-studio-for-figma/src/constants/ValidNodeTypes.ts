// Cast as unknown first because 'SLOT' is not yet in @figma/plugin-typings.
// Remove the cast once Figma ships official SlotNode typings.
export const ValidNodeTypes = [
  'BOOLEAN_OPERATION',
  'COMPONENT',
  'COMPONENT_SET',
  'ELLIPSE',
  'FRAME',
  'GROUP',
  'INSTANCE',
  'LINE',
  'POLYGON',
  'RECTANGLE',
  'SLOT',
  'TEXT',
  'VECTOR',
  'STAR',
] as unknown as NodeType[];
