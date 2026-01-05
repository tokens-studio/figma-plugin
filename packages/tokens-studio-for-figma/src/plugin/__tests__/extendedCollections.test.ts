import pullVariables from '../pullVariables';
import { createNecessaryVariableCollections } from '../createNecessaryVariableCollections';
import * as notifiers from '../notifiers';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { ThemeObject } from '@/types';

jest.mock('../getVariablesWithoutZombies');
jest.mock('@/AsyncMessageChannel');

describe('Extended Collections', () => {
    let notifyVariableValuesSpy: jest.SpyInstance;
    let getVariablesWithoutZombiesMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        notifyVariableValuesSpy = jest.spyOn(notifiers, 'notifyVariableValues');
        getVariablesWithoutZombiesMock = require('../getVariablesWithoutZombies').getVariablesWithoutZombies;

        (AsyncMessageChannel.PluginInstance.message as jest.Mock).mockResolvedValue({
            themes: [],
        });
    });

    describe('Import Extended Collections', () => {
        beforeEach(() => {
            // Mock Figma API
            global.figma = {
                variables: {
                    getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([
                        {
                            id: 'parent-coll-id',
                            name: 'Mode',
                            modes: [
                                { name: 'Light', modeId: 'parent-light-mode' },
                                { name: 'Dark', modeId: 'parent-dark-mode' },
                            ],
                        },
                        {
                            id: 'extended-coll-a-id',
                            name: 'Mode (Brand A)',
                            modes: [
                                { name: 'Light', modeId: 'ext-a-light-mode', parentModeId: 'parent-light-mode' },
                                { name: 'Dark', modeId: 'ext-a-dark-mode', parentModeId: 'parent-dark-mode' },
                            ],
                            isExtension: true,
                            parentVariableCollectionId: 'parent-coll-id',
                            variableOverrides: {
                                'var-color-primary': {
                                    'ext-a-light-mode': { r: 1, g: 0, b: 0, a: 1 }, // Red override
                                    'ext-a-dark-mode': { r: 0.5, g: 0, b: 0, a: 1 }, // Dark red override
                                },
                            },
                        },
                        {
                            id: 'extended-coll-b-id',
                            name: 'Mode (Brand B)',
                            modes: [
                                { name: 'Light', modeId: 'ext-b-light-mode', parentModeId: 'parent-light-mode' },
                                { name: 'Dark', modeId: 'ext-b-dark-mode', parentModeId: 'parent-dark-mode' },
                            ],
                            isExtension: true,
                            parentVariableCollectionId: 'parent-coll-id',
                            variableOverrides: {
                                'var-color-primary': {
                                    'ext-b-light-mode': { r: 0, g: 0, b: 1, a: 1 }, // Blue override
                                    'ext-b-dark-mode': { r: 0, g: 0, b: 0.5, a: 1 }, // Dark blue override
                                },
                            },
                        },
                    ]),
                    getVariableById: jest.fn().mockReturnValue({ name: 'ReferencedVariable' }),
                },
                ui: { postMessage: jest.fn() },
                clientStorage: {
                    getAsync: jest.fn().mockResolvedValue(JSON.stringify({ baseFontSize: 16 })),
                },
            } as any;

            // Mock variable data
            getVariablesWithoutZombiesMock.mockResolvedValue([
                {
                    id: 'var-color-primary',
                    name: 'color/primary',
                    resolvedType: 'COLOR',
                    variableCollectionId: 'parent-coll-id',
                    valuesByMode: {
                        'parent-light-mode': { r: 0, g: 1, b: 0, a: 1 }, // Green (parent value)
                        'parent-dark-mode': { r: 0, g: 0.5, b: 0, a: 1 }, // Dark green (parent value)
                    },
                },
            ]);
        });

        it('should detect extended collections', async () => {
            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const themes = call[1] as ThemeObject[];

            // Should have 2 parent themes + 4 extended themes = 6 total
            expect(themes).toHaveLength(6);

            // Parent themes
            expect(themes.find(t => t.name === 'Light' && t.group === 'Mode')).toBeDefined();
            expect(themes.find(t => t.name === 'Dark' && t.group === 'Mode')).toBeDefined();

            // Extended themes
            expect(themes.find(t => t.name === 'Light' && t.group === 'Mode/Mode (Brand A)')).toBeDefined();
            expect(themes.find(t => t.name === 'Dark' && t.group === 'Mode/Mode (Brand A)')).toBeDefined();
            expect(themes.find(t => t.name === 'Light' && t.group === 'Mode/Mode (Brand B)')).toBeDefined();
            expect(themes.find(t => t.name === 'Dark' && t.group === 'Mode/Mode (Brand B)')).toBeDefined();
        });

        it('should set correct extended collection metadata', async () => {
            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const themes = call[1] as ThemeObject[];

            const extendedTheme = themes.find(t => t.name === 'Light' && t.group === 'Mode/Mode (Brand A)');

            expect(extendedTheme?.$figmaIsExtension).toBe(true);
            expect(extendedTheme?.$figmaParentCollectionId).toBe('parent-coll-id');
            expect(extendedTheme?.$figmaParentThemeId).toBeDefined();
        });

        it('should create token sets for parent collection', async () => {
            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const tokens = call[0];

            // Parent collection should have tokens
            expect(tokens.colors).toContainEqual(
                expect.objectContaining({
                    name: 'color/primary',
                    parent: 'Mode/Light',
                    value: '#00ff00', // Green
                })
            );
            expect(tokens.colors).toContainEqual(
                expect.objectContaining({
                    name: 'color/primary',
                    parent: 'Mode/Dark',
                    value: '#008000', // Dark green
                })
            );
        });

        it('should create token sets for extended collections with OVERRIDDEN values', async () => {
            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const tokens = call[0];

            // Extended collection A should have RED override
            expect(tokens.colors).toContainEqual(
                expect.objectContaining({
                    name: 'color/primary',
                    parent: 'Mode (Brand A)/Light',
                    value: '#ff0000', // Red override
                })
            );
            expect(tokens.colors).toContainEqual(
                expect.objectContaining({
                    name: 'color/primary',
                    parent: 'Mode (Brand A)/Dark',
                    value: '#800000', // Dark red override
                })
            );

            // Extended collection B should have BLUE override
            expect(tokens.colors).toContainEqual(
                expect.objectContaining({
                    name: 'color/primary',
                    parent: 'Mode (Brand B)/Light',
                    value: '#0000ff', // Blue override
                })
            );
            expect(tokens.colors).toContainEqual(
                expect.objectContaining({
                    name: 'color/primary',
                    parent: 'Mode (Brand B)/Dark',
                    value: '#000080', // Dark blue override
                })
            );
        });

        it('should handle extended collections without overrides (inherit parent values)', async () => {
            (global.figma.variables.getLocalVariableCollectionsAsync as jest.Mock).mockResolvedValue([
                {
                    id: 'parent-coll-id',
                    name: 'Mode',
                    modes: [{ name: 'Light', modeId: 'parent-light-mode' }],
                },
                {
                    id: 'extended-coll-id',
                    name: 'Mode (Brand)',
                    modes: [{ name: 'Light', modeId: 'ext-light-mode', parentModeId: 'parent-light-mode' }],
                    isExtension: true,
                    parentVariableCollectionId: 'parent-coll-id',
                    variableOverrides: {}, // No overrides
                },
            ]);

            getVariablesWithoutZombiesMock.mockResolvedValue([
                {
                    id: 'var-color',
                    name: 'color',
                    resolvedType: 'COLOR',
                    variableCollectionId: 'parent-coll-id',
                    valuesByMode: {
                        'parent-light-mode': { r: 1, g: 1, b: 1, a: 1 },
                    },
                },
            ]);

            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const tokens = call[0];

            // Extended collection should inherit parent value (white)
            expect(tokens.colors).toContainEqual(
                expect.objectContaining({
                    name: 'color',
                    parent: 'Mode (Brand)/Light',
                    value: '#ffffff',
                })
            );
        });

        it('should link extended themes to parent themes', async () => {
            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const themes = call[1] as ThemeObject[];

            const parentTheme = themes.find(t => t.name === 'Light' && t.group === 'Mode');
            const extendedTheme = themes.find(t => t.name === 'Light' && t.group === 'Mode/Mode (Brand A)');

            expect(extendedTheme?.$figmaParentThemeId).toBe(parentTheme?.id);
        });
    });

    describe('Export Extended Collections', () => {
        beforeEach(() => {
            global.figma = {
                variables: {
                    getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([]),
                },
            } as any;
        });

        it('should create extended collection using extend() API', async () => {
            const parentCollection = {
                id: 'parent-id',
                name: 'Parent Collection',
                modes: [{ name: 'Light', modeId: 'light-mode' }],
                extend: jest.fn().mockReturnValue({
                    id: 'extended-id',
                    name: 'Extended Collection',
                    modes: [{ name: 'Light', modeId: 'ext-light-mode' }],
                    renameMode: jest.fn(),
                }),
            };

            (global.figma.variables.getLocalVariableCollectionsAsync as jest.Mock).mockResolvedValue([
                parentCollection,
            ]);

            const themes: ThemeObject[] = [
                {
                    id: 'parent-theme-id',
                    name: 'Light',
                    group: 'Parent Collection',
                    selectedTokenSets: {},
                    $figmaStyleReferences: {},
                    $figmaVariableReferences: {},
                    $figmaModeId: 'light-mode',
                    $figmaCollectionId: 'parent-id',
                },
                {
                    id: 'extended-theme-id',
                    name: 'Light',
                    group: 'Parent Collection/Extended Collection',
                    selectedTokenSets: {},
                    $figmaStyleReferences: {},
                    $figmaVariableReferences: {},
                    $figmaModeId: undefined,
                    $figmaCollectionId: undefined,
                    $figmaIsExtension: true,
                    $figmaParentCollectionId: 'parent-id',
                    $figmaParentThemeId: 'parent-theme-id',
                },
            ];

            await createNecessaryVariableCollections(themes, ['parent-theme-id', 'extended-theme-id']);

            expect(parentCollection.extend).toHaveBeenCalledWith('Extended Collection');
        });

        it('should handle missing extend() API gracefully (non-Enterprise)', async () => {
            const parentCollection = {
                id: 'parent-id',
                name: 'Parent Collection',
                modes: [{ name: 'Light', modeId: 'light-mode' }],
                // No extend method
            };

            (global.figma.variables.getLocalVariableCollectionsAsync as jest.Mock).mockResolvedValue([
                parentCollection,
            ]);

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const themes: ThemeObject[] = [
                {
                    id: 'extended-theme-id',
                    name: 'Light',
                    group: 'Parent Collection/Extended Collection',
                    selectedTokenSets: {},
                    $figmaStyleReferences: {},
                    $figmaVariableReferences: {},
                    $figmaModeId: undefined,
                    $figmaCollectionId: undefined,
                    $figmaIsExtension: true,
                    $figmaParentCollectionId: 'parent-id',
                    $figmaParentThemeId: 'parent-theme-id',
                },
            ];

            // Should not throw
            await expect(
                createNecessaryVariableCollections(themes, ['extended-theme-id'])
            ).resolves.not.toThrow();

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Cannot create extended collection'),
                expect.anything()
            );

            consoleSpy.mockRestore();
        });

        it('should update existing extended collections', async () => {
            const existingExtendedCollection = {
                id: 'extended-id',
                name: 'Old Name',
                modes: [{ name: 'Light', modeId: 'ext-light-mode' }],
                renameMode: jest.fn(),
            };

            (global.figma.variables.getLocalVariableCollectionsAsync as jest.Mock).mockResolvedValue([
                {
                    id: 'parent-id',
                    name: 'Parent',
                    modes: [{ name: 'Light', modeId: 'light-mode' }],
                },
                existingExtendedCollection,
            ]);

            const themes: ThemeObject[] = [
                {
                    id: 'extended-theme-id',
                    name: 'Light',
                    group: 'Parent/New Name',
                    selectedTokenSets: {},
                    $figmaStyleReferences: {},
                    $figmaVariableReferences: {},
                    $figmaModeId: 'ext-light-mode',
                    $figmaCollectionId: 'extended-id',
                    $figmaIsExtension: true,
                    $figmaParentCollectionId: 'parent-id',
                },
            ];

            const result = await createNecessaryVariableCollections(themes, ['extended-theme-id']);

            expect(result[0].name).toBe('New Name');
        });
    });

    describe('Backwards Compatibility', () => {
        it('should handle regular collections when no extended collections exist', async () => {
            global.figma = {
                variables: {
                    getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([
                        {
                            id: 'regular-coll-id',
                            name: 'Regular Collection',
                            modes: [{ name: 'Light', modeId: 'light-mode' }],
                        },
                    ]),
                    getVariableById: jest.fn(),
                },
                ui: { postMessage: jest.fn() },
                clientStorage: {
                    getAsync: jest.fn().mockResolvedValue(JSON.stringify({ baseFontSize: 16 })),
                },
            } as any;

            getVariablesWithoutZombiesMock.mockResolvedValue([
                {
                    id: 'var-id',
                    name: 'color',
                    resolvedType: 'COLOR',
                    variableCollectionId: 'regular-coll-id',
                    valuesByMode: {
                        'light-mode': { r: 1, g: 1, b: 1, a: 1 },
                    },
                },
            ]);

            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const themes = call[1] as ThemeObject[];

            expect(themes).toHaveLength(1);
            expect(themes[0].$figmaIsExtension).toBeUndefined();
            expect(themes[0].group).toBe('Regular Collection');
        });

        it('should handle mixed regular and extended collections', async () => {
            global.figma = {
                variables: {
                    getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([
                        {
                            id: 'regular-id',
                            name: 'Regular',
                            modes: [{ name: 'Light', modeId: 'reg-light' }],
                        },
                        {
                            id: 'parent-id',
                            name: 'Parent',
                            modes: [{ name: 'Light', modeId: 'parent-light' }],
                        },
                        {
                            id: 'extended-id',
                            name: 'Extended',
                            modes: [{ name: 'Light', modeId: 'ext-light', parentModeId: 'parent-light' }],
                            isExtension: true,
                            parentVariableCollectionId: 'parent-id',
                            variableOverrides: {},
                        },
                    ]),
                    getVariableById: jest.fn(),
                },
                ui: { postMessage: jest.fn() },
                clientStorage: {
                    getAsync: jest.fn().mockResolvedValue(JSON.stringify({ baseFontSize: 16 })),
                },
            } as any;

            getVariablesWithoutZombiesMock.mockResolvedValue([
                {
                    id: 'var1',
                    name: 'color1',
                    resolvedType: 'COLOR',
                    variableCollectionId: 'regular-id',
                    valuesByMode: { 'reg-light': { r: 1, g: 0, b: 0, a: 1 } },
                },
                {
                    id: 'var2',
                    name: 'color2',
                    resolvedType: 'COLOR',
                    variableCollectionId: 'parent-id',
                    valuesByMode: { 'parent-light': { r: 0, g: 1, b: 0, a: 1 } },
                },
            ]);

            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const themes = call[1] as ThemeObject[];

            // 1 regular + 1 parent + 1 extended = 3 themes
            expect(themes).toHaveLength(3);

            const regularTheme = themes.find(t => t.group === 'Regular');
            const extendedTheme = themes.find(t => t.group === 'Parent/Extended');

            expect(regularTheme?.$figmaIsExtension).toBeUndefined();
            expect(extendedTheme?.$figmaIsExtension).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle extended collections with no parent found', async () => {
            global.figma = {
                variables: {
                    getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([
                        {
                            id: 'orphan-ext-id',
                            name: 'Orphan Extended',
                            modes: [{ name: 'Light', modeId: 'orphan-light', parentModeId: 'missing-parent' }],
                            isExtension: true,
                            parentVariableCollectionId: 'missing-parent-id', // Parent doesn't exist
                            variableOverrides: {},
                        },
                    ]),
                    getVariableById: jest.fn(),
                },
                ui: { postMessage: jest.fn() },
                clientStorage: {
                    getAsync: jest.fn().mockResolvedValue(JSON.stringify({ baseFontSize: 16 })),
                },
            } as any;

            getVariablesWithoutZombiesMock.mockResolvedValue([]);

            // Should not throw
            await expect(
                pullVariables({ useDimensions: false, useRem: false }, [], true)
            ).resolves.not.toThrow();
        });

        it('should handle variable aliases in extended collections', async () => {
            global.figma = {
                variables: {
                    getLocalVariableCollectionsAsync: jest.fn().mockResolvedValue([
                        {
                            id: 'parent-id',
                            name: 'Parent',
                            modes: [{ name: 'Light', modeId: 'parent-light' }],
                        },
                        {
                            id: 'ext-id',
                            name: 'Extended',
                            modes: [{ name: 'Light', modeId: 'ext-light', parentModeId: 'parent-light' }],
                            isExtension: true,
                            parentVariableCollectionId: 'parent-id',
                            variableOverrides: {
                                'alias-var': {
                                    'ext-light': { type: 'VARIABLE_ALIAS', id: 'target-var-id' },
                                },
                            },
                        },
                    ]),
                    getVariableById: jest.fn().mockReturnValue({ name: 'referenced/variable' }),
                },
                ui: { postMessage: jest.fn() },
                clientStorage: {
                    getAsync: jest.fn().mockResolvedValue(JSON.stringify({ baseFontSize: 16 })),
                },
            } as any;

            getVariablesWithoutZombiesMock.mockResolvedValue([
                {
                    id: 'alias-var',
                    name: 'alias',
                    resolvedType: 'COLOR',
                    variableCollectionId: 'parent-id',
                    valuesByMode: {
                        'parent-light': { r: 0, g: 0, b: 0, a: 1 },
                    },
                },
            ]);

            await pullVariables({ useDimensions: false, useRem: false }, [], true);

            const call = notifyVariableValuesSpy.mock.calls[0];
            const tokens = call[0];

            // Extended collection override should be an alias
            expect(tokens.colors).toContainEqual(
                expect.objectContaining({
                    name: 'alias',
                    parent: 'Extended/Light',
                    value: '{referenced.variable}',
                })
            );
        });
    });
});
