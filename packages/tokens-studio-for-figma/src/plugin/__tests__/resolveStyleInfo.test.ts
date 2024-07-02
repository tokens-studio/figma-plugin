import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  mockGetLocalPaintStyles,
  mockGetLocalEffectStyles,
  mockGetLocalTextStyles,
  mockImportStyleByKeyAsync,
} from '../../../tests/__mocks__/figmaMock';
import { resolveStyleInfo } from '../asyncMessageHandlers';

describe('resolveStyleInfo', () => {
  it('should be able to resolve the style info', async () => {
    const mockLocalPaintStyles = [
      {
        id: 'S:paint:1234',
        key: 'S:paint:1234',
        name: 'colors/brand/primary',
      },
    ];

    const mockLocalTextStyles = [
      {
        id: 'S:text:1234',
        key: 'S:text:1234',
        name: 'typography/heading/h1',
      },
    ];

    const mockLocalEffectStyles = [
      {
        id: 'S:effect:1234',
        key: 'S:effect:1234',
        name: 'shadows/lg',
      },
    ];

    mockGetLocalPaintStyles.mockImplementationOnce(() => mockLocalPaintStyles);
    mockGetLocalEffectStyles.mockImplementationOnce(() => mockLocalEffectStyles);
    mockGetLocalTextStyles.mockImplementationOnce(() => mockLocalTextStyles);
    mockImportStyleByKeyAsync.mockImplementationOnce(() => ({
      id: 'S:remote,',
      key: 'remote',
      name: 'remote-style',
    }));

    const result = await resolveStyleInfo({
      type: AsyncMessageTypes.RESOLVE_STYLE_INFO,
      styleIds: ['S:2345', 'S:paint:1234', 'S:text:1234', 'S:effect:1234', 'S:remote,'],
    });

    expect(result.resolvedValues).toEqual([
      { id: 'S:2345' }, // unresolved
      { id: 'S:paint:1234', key: 'S:paint:1234', name: 'colors/brand/primary' },
      { id: 'S:text:1234', key: 'S:text:1234', name: 'typography/heading/h1' },
      { id: 'S:effect:1234', key: 'S:effect:1234', name: 'shadows/lg' },
      { id: 'S:remote,', key: 'remote', name: 'remote-style' },
    ]);
  });
});
