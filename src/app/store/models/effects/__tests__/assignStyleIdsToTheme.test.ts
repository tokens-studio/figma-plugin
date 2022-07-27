import { store } from '@/app/store';
import { assignStyleIdsToTheme } from '../tokenState';

describe('assignStyleIdsToTheme', () => {
  it('should work', () => {
    const updateDocumentSpy = jest.spyOn(store.dispatch.tokenState, 'updateDocument');
    updateDocumentSpy.mockReturnValueOnce();
    assignStyleIdsToTheme(store.dispatch)();
    expect(updateDocumentSpy).toBeCalledTimes(1);
  });
});
