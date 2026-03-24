/**
 * Temporary type declarations for Figma's SlotNode.
 * Figma released Slots but has not yet updated @figma/plugin-typings.
 * Remove this file once official typings land.
 */
declare global {
  // SlotNode behaves like a FrameNode — it supports children, layout, fills,
  // strokes, corner radius, effects, variables, and all frame-equivalent properties.
  interface SlotNode
    extends BaseNodeMixin,
      ChildrenMixin,
      CornerMixin,
      RectangleCornerMixin,
      BlendMixin,
      ConstraintMixin,
      LayoutMixin,
      ExplicitVariableModesMixin,
      MinimalBlendMixin,
      FramePrototypingMixin,
      ReactionMixin,
      VariableConsumptionMixin {
    readonly type: 'SLOT';
    clone(): SlotNode;
  }
}

export {};
