import { setThemesFromVariables } from './setThemesFromVariables';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';

jest.mock('./utils/pushThemeToTokensStudioOAuth', () => ({
  pushThemeToTokensStudioOAuth: jest.fn(),
  notifyThemePushFailures: jest.fn(),
}));

describe('setThemesFromVariables', () => {
  it('updates the document and leaves the Studio push to writeVariableImportToTokensStudio', () => {
    const dispatch: any = { tokenState: { updateDocument: jest.fn() } };

    setThemesFromVariables(dispatch)([{ id: 'local-id', name: 'Dark', group: 'Colors' }] as any, {});

    expect(dispatch.tokenState.updateDocument).toHaveBeenCalledWith({ updateRemote: true, shouldUpdateNodes: false });
    expect(pushThemeToTokensStudioOAuth).not.toHaveBeenCalled();
  });
});
