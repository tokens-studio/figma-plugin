import { StorageProviderType } from '@/constants/StorageProviderType';
import { getStudioSimpleView, isStudioSimpleViewSelector, studioSimpleViewSelector } from '../studioSimpleViewSelector';

const simpleView = { projectId: 'project-1', active: true, collections: [] };

const state = (api: any, studioSimpleView: any = simpleView) => ({
  uiState: { api },
  tokenState: { studioSimpleView },
}) as any;

const studioApi = { provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', orgId: 'org-1' };

describe('studioSimpleViewSelector', () => {
  it('is on for the connected Tokens Studio project in Simple view', () => {
    expect(studioSimpleViewSelector(state(studioApi))).toBe(simpleView);
    expect(isStudioSimpleViewSelector(state(studioApi))).toBe(true);
    expect(getStudioSimpleView(state(studioApi))).toBe(simpleView);
  });

  it('is off for an Advanced Studio project or one never read', () => {
    expect(isStudioSimpleViewSelector(state(studioApi, { ...simpleView, active: false }))).toBe(false);
    expect(isStudioSimpleViewSelector(state(studioApi, null))).toBe(false);
  });

  it('is off once the plugin syncs with another project', () => {
    expect(isStudioSimpleViewSelector(state({ ...studioApi, id: 'project-2' }))).toBe(false);
  });

  it('is off for every other provider and for local tokens, whatever was read before', () => {
    expect(isStudioSimpleViewSelector(state({ provider: StorageProviderType.GITHUB, id: 'project-1' }))).toBe(false);
    expect(isStudioSimpleViewSelector(state({ provider: StorageProviderType.JSONBIN, id: 'project-1' }))).toBe(false);
    expect(isStudioSimpleViewSelector(state({ provider: StorageProviderType.LOCAL }))).toBe(false);
    expect(isStudioSimpleViewSelector(state(null))).toBe(false);
  });
});
