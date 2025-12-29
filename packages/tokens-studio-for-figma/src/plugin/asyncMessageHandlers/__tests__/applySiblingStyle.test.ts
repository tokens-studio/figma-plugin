import { applySiblingStyleId } from '../applySiblingStyle';
import * as getSiblingStyleId from '../getSiblingStyleId';

describe('applySiblingStyleId', () => {
    const getNewStyleIdSpy = jest.spyOn(getSiblingStyleId, 'getNewStyleId');

    beforeEach(() => {
        getNewStyleIdSpy.mockReset();
    });

    it('should swap styles and recurse into children for a FRAME', async () => {
        const mockChild = {
            type: 'RECTANGLE',
            fillStyleId: 'style-1',
        };
        const mockNode = {
            type: 'FRAME',
            children: [mockChild],
            fillStyleId: 'style-2',
        } as any;

        getNewStyleIdSpy.mockResolvedValue('new-style');

        await applySiblingStyleId(mockNode, {}, {}, []);

        expect(getNewStyleIdSpy).toHaveBeenCalledWith('style-2', {}, {}, []);
        expect(getNewStyleIdSpy).toHaveBeenCalledWith('style-1', {}, {}, []);
        expect(mockNode.fillStyleId).toBe('new-style');
        expect(mockChild.fillStyleId).toBe('new-style');
    });

    it('should skip INSTANCE children but process the COMPONENT itself', async () => {
        const mockInstanceChild = {
            type: 'INSTANCE',
            fillStyleId: 'style-instance',
        };
        const mockRectChild = {
            type: 'RECTANGLE',
            fillStyleId: 'style-rect',
        };
        const mockNode = {
            type: 'COMPONENT',
            children: [mockInstanceChild, mockRectChild],
            fillStyleId: 'style-comp',
        } as any;

        getNewStyleIdSpy.mockResolvedValue('new-style');

        await applySiblingStyleId(mockNode, {}, {}, []);

        // Should be called for COMPONENT and RECTANGLE, but NOT INSTANCE child
        expect(getNewStyleIdSpy).toHaveBeenCalledWith('style-comp', {}, {}, []);
        expect(getNewStyleIdSpy).toHaveBeenCalledWith('style-rect', {}, {}, []);
        expect(getNewStyleIdSpy).not.toHaveBeenCalledWith('style-instance', {}, {}, []);

        expect(mockNode.fillStyleId).toBe('new-style');
        expect(mockRectChild.fillStyleId).toBe('new-style');
        expect(mockInstanceChild.fillStyleId).toBe('style-instance'); // Should remain unchanged
    });

    it('should skip INSTANCE children but process the COMPONENT_SET itself', async () => {
        const mockInstanceChild = {
            type: 'INSTANCE',
            fillStyleId: 'style-instance',
        };
        const mockNode = {
            type: 'COMPONENT_SET',
            children: [mockInstanceChild],
            fillStyleId: 'style-comp-set',
        } as any;

        getNewStyleIdSpy.mockResolvedValue('new-style');

        await applySiblingStyleId(mockNode, {}, {}, []);

        expect(getNewStyleIdSpy).toHaveBeenCalledWith('style-comp-set', {}, {}, []);
        expect(getNewStyleIdSpy).not.toHaveBeenCalledWith('style-instance', {}, {}, []);

        expect(mockNode.fillStyleId).toBe('new-style');
        expect(mockInstanceChild.fillStyleId).toBe('style-instance');
    });
});
