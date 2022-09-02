import { store } from '@/app/store';
import { removeStyleIdsToCurrentTheme } from '../tokenState';

describe('removeStyleIdsToCurrentTheme', () => {
  it('should work', () => {
    const updateDocumentSpy = jest.spyOn(store.dispatch.tokenState, 'updateDocument');
    updateDocumentSpy.mockReturnValueOnce();
    removeStyleIdsToCurrentTheme(store.dispatch)();
    expect(updateDocumentSpy).toBeCalledTimes(1);
  });
});
