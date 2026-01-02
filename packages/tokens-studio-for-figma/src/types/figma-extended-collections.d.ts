/**
 * Type augmentation for Figma Plugin API to support Extended Variable Collections.
 * 
 * Extended variable collections are a feature where a child collection can inherit
 * variables and modes from a parent collection, with the ability to override values.
 * 
 * These properties exist in the Figma runtime but may not be documented or typed
 * in the official @figma/plugin-typings package.
 */

declare global {
  interface VariableCollection {
    /**
     * The ID of the parent variable collection if this is an extended collection.
     * This property may exist on the prototype rather than as an own-property.
     * 
     * @readonly
     */
    parentVariableCollectionId?: string | null;

    /**
     * Creates a new extended variable collection that inherits from this collection.
     * Available on collections that can be extended.
     * 
     * @param name - The name for the new extended collection
     * @returns The newly created extended variable collection
     */
    extend?(name: string): VariableCollection;

    /**
     * Map of variable overrides in this collection.
     * Key: variableId
     * Value: Record of modeId -> value overrides
     * 
     * @readonly
     */
    variableOverrides?: Record<string, Record<string, VariableValue>>;

    /**
     * Removes all overrides for a specific variable in this collection.
     * The variable will inherit values from the parent collection again.
     * 
     * @param variable - The Variable node (not the ID string)
     */
    removeOverridesForVariable?(variable: Variable): void;
  }

  interface Variable {
    /**
     * Gets the effective values for this variable in the context of a specific collection.
     * For extended collections, this returns values with overrides applied.
     * 
     * @param collection - The collection to get effective values for
     * @returns Record of modeId -> value for the given collection
     */
    valuesByModeForCollectionAsync?(
      collection: VariableCollection
    ): Promise<Record<string, VariableValue>>;
  }
}

export {};
