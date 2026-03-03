import { ValidNodeTypes } from '@/constants/ValidNodeTypes';
import { findAll } from '../findAll';

describe('findAll', () => {
    it('should find all nodes including self', () => {
        const mockNodes = [
            {
                id: '1',
                type: 'FRAME',
                children: [
                    { id: '2', type: 'RECTANGLE' },
                ],
                findAllWithCriteria: jest.fn().mockReturnValue([{ id: '2', type: 'RECTANGLE' }]),
            },
        ] as any;

        const result = findAll(mockNodes, true);
        expect(result).toHaveLength(2);
        expect(result.map(n => n.id)).toContain('1');
        expect(result.map(n => n.id)).toContain('2');
    });

    it('should exclude instances when recursing from a COMPONENT', () => {
        const mockNodes = [
            {
                id: 'component-1',
                type: 'COMPONENT',
                children: [
                    { id: 'rect-1', type: 'RECTANGLE' },
                    { id: 'instance-1', type: 'INSTANCE' },
                ],
                findAllWithCriteria: jest.fn().mockReturnValue([
                    { id: 'rect-1', type: 'RECTANGLE' },
                    { id: 'instance-1', type: 'INSTANCE' },
                ]),
            },
        ] as any;

        const result = findAll(mockNodes, true);
        // Should include COMPONENT and RECTANGLE, but NOT INSTANCE
        expect(result).toHaveLength(2);
        expect(result.map(n => n.id)).toContain('component-1');
        expect(result.map(n => n.id)).toContain('rect-1');
        expect(result.map(n => n.id)).not.toContain('instance-1');
    });

    it('should exclude instances when recursing from a COMPONENT_SET', () => {
        const mockNodes = [
            {
                id: 'component-set-1',
                type: 'COMPONENT_SET',
                children: [
                    { id: 'rect-1', type: 'RECTANGLE' },
                    { id: 'instance-1', type: 'INSTANCE' },
                ],
                findAllWithCriteria: jest.fn().mockReturnValue([
                    { id: 'rect-1', type: 'RECTANGLE' },
                    { id: 'instance-1', type: 'INSTANCE' },
                ]),
            },
        ] as any;

        const result = findAll(mockNodes, true);
        // Should include COMPONENT_SET and RECTANGLE, but NOT INSTANCE
        expect(result).toHaveLength(2);
        expect(result.map(n => n.id)).toContain('component-set-1');
        expect(result.map(n => n.id)).toContain('rect-1');
        expect(result.map(n => n.id)).not.toContain('instance-1');
    });

    it('should NOT exclude instances when recursing from a FRAME', () => {
        const mockNodes = [
            {
                id: 'frame-1',
                type: 'FRAME',
                children: [
                    { id: 'rect-1', type: 'RECTANGLE' },
                    { id: 'instance-1', type: 'INSTANCE' },
                ],
                findAllWithCriteria: jest.fn().mockReturnValue([
                    { id: 'rect-1', type: 'RECTANGLE' },
                    { id: 'instance-1', type: 'INSTANCE' },
                ]),
            },
        ] as any;

        const result = findAll(mockNodes, true);
        // Should include FRAME, RECTANGLE, AND INSTANCE
        expect(result).toHaveLength(3);
        expect(result.map(n => n.id)).toContain('frame-1');
        expect(result.map(n => n.id)).toContain('rect-1');
        expect(result.map(n => n.id)).toContain('instance-1');
    });
});
