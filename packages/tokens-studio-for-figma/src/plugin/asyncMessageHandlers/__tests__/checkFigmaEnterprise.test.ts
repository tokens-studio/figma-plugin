import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { checkFigmaEnterprise, resetFigmaEnterpriseCache } from '../checkFigmaEnterprise';

const invoke = () => checkFigmaEnterprise({ type: AsyncMessageTypes.CHECK_FIGMA_ENTERPRISE });

describe('checkFigmaEnterprise', () => {
  let getLocalVariableCollectionsAsync: jest.Mock;
  let createVariableCollection: jest.Mock;
  let extend: jest.Mock;
  let removeExtended: jest.Mock;
  let removeProbe: jest.Mock;

  beforeEach(() => {
    resetFigmaEnterpriseCache();

    removeExtended = jest.fn();
    removeProbe = jest.fn();
    extend = jest.fn().mockResolvedValue({ remove: removeExtended });
    createVariableCollection = jest.fn().mockImplementation(() => ({
      extend,
      remove: removeProbe,
    }));
    getLocalVariableCollectionsAsync = jest.fn().mockResolvedValue([]);

    global.figma = {
      variables: {
        getLocalVariableCollectionsAsync,
        createVariableCollection,
      },
    } as any;
  });

  it('caches the result for the rest of the session (no second probe)', async () => {
    // Even a probing (mutating) first call must lock in — subsequent modal opens
    // must not repeatedly create/delete collections in the user's document.
    const first = await invoke();
    const second = await invoke();
    const third = await invoke();

    expect(first).toEqual({ isFigmaEnterprise: true });
    expect(second).toEqual({ isFigmaEnterprise: true });
    expect(third).toEqual({ isFigmaEnterprise: true });
    // Fast path + probe fire once (first call). Later calls short-circuit on the cache.
    expect(getLocalVariableCollectionsAsync).toHaveBeenCalledTimes(1);
    expect(createVariableCollection).toHaveBeenCalledTimes(1);
  });

  it('uses a non-mutating fast path when an existing extended collection is present', async () => {
    getLocalVariableCollectionsAsync.mockResolvedValueOnce([
      { id: 'child-1', name: 'Brand', isExtension: true },
    ]);

    const result = await invoke();

    expect(result).toEqual({ isFigmaEnterprise: true });
    // No collection created or removed — the document is untouched
    expect(createVariableCollection).not.toHaveBeenCalled();
    expect(removeProbe).not.toHaveBeenCalled();
  });

  it('falls back to the extend() probe when no existing extension is found, and cleans up', async () => {
    // No existing extended collections → probe is required
    getLocalVariableCollectionsAsync.mockResolvedValueOnce([]);

    const result = await invoke();

    expect(result).toEqual({ isFigmaEnterprise: true });
    expect(createVariableCollection).toHaveBeenCalledWith('__ts_probe__');
    expect(extend).toHaveBeenCalledWith('__ts_ext_probe__');
    // Both temp collections are removed (probe + extended probe)
    expect(removeExtended).toHaveBeenCalled();
    expect(removeProbe).toHaveBeenCalled();
  });

  it('returns false when extend() is unsupported (non-Enterprise), and still cleans up', async () => {
    getLocalVariableCollectionsAsync.mockResolvedValueOnce([]);
    extend.mockRejectedValueOnce(new Error('extend is not a function'));

    const result = await invoke();

    expect(result).toEqual({ isFigmaEnterprise: false });
    // Probe is removed even when extend() throws
    expect(removeProbe).toHaveBeenCalled();
  });

  it('resolves to false (never rejects) when createVariableCollection throws (view-only file)', async () => {
    // View-only contexts or plan limits make createVariableCollection throw.
    // The caller treats a rejection as non-Enterprise, but a thrown error would
    // otherwise skip the cache and re-probe forever — so the handler must catch.
    getLocalVariableCollectionsAsync.mockResolvedValueOnce([]);
    createVariableCollection.mockImplementationOnce(() => {
      throw new Error('read-only document');
    });

    await expect(invoke()).resolves.toEqual({ isFigmaEnterprise: false });

    // And the cache locks in the false result — no second probe
    const second = await invoke();
    expect(second).toEqual({ isFigmaEnterprise: false });
    expect(createVariableCollection).toHaveBeenCalledTimes(1);
  });
});
