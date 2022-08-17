import * as rooks from 'rooks';
import { renderHook } from '@testing-library/react-hooks';
import { useShortcut, activeShortcuts } from '../useShortcut';

const useKeysSpy = jest.spyOn(rooks, 'useKeys');
const warnSpy = jest.spyOn(console, 'warn');

describe('useShortcut', () => {
  it('should work', () => {
    const handler = () => {};
    const hookResult = renderHook(
      () => useShortcut(['KeyS'], handler),
    );
    expect(useKeysSpy).toBeCalledTimes(1);
    expect(useKeysSpy).toBeCalledWith(['KeyS'], handler, {
      preventLostKeyup: true,
    });
    expect(warnSpy).toBeCalledTimes(0);
    expect(activeShortcuts).toEqual(['KeyS']);
    activeShortcuts.splice(0, 1);
    hookResult.unmount();
  });

  it('should work and warn for duplicate shortcuts', () => {
    activeShortcuts.push('KeyS');

    const handler = () => {};
    const hookResult = renderHook(
      () => useShortcut(['KeyS'], handler),
    );
    expect(useKeysSpy).toBeCalledTimes(1);
    expect(useKeysSpy).toBeCalledWith(['KeyS'], handler, {
      preventLostKeyup: true,
    });
    expect(warnSpy).toBeCalledTimes(1);
    expect(activeShortcuts).toEqual(['KeyS', 'KeyS']);
    activeShortcuts.splice(0, 1);
    hookResult.unmount();
  });
});
