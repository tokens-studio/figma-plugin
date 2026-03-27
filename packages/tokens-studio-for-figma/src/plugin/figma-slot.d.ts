/**
 * Temporary type declarations for Figma's SlotNode.
 * Figma released Slots but has not yet updated @figma/plugin-typings on npm.
 * Source: https://github.com/figma/plugin-typings/tree/owong/slots-plugin-typings
 * Remove this file once official typings land.
 */
declare global {
  // SlotNode extends DefaultFrameMixin — same capability surface as FrameNode.
  interface SlotNode extends DefaultFrameMixin {
    readonly type: 'SLOT';
    /** Resets a given slot node to the original component slot content. */
    resetSlot(): void;
    readonly isAssignedSlot: boolean;
  }
}

export {};
