import { init, RematchStore } from '@rematch/core';
import i18next from 'i18next';
import { RootModel } from '@/types/RootModel';
import { models } from './index';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { SettingsState } from './settings';

jest.mock('i18next', () => ({
  changeLanguage: jest.fn(),
}));

type Store = RematchStore<RootModel, Record<string, never>>;

const i18nextMocked = i18next.changeLanguage as jest.MockedFunction<typeof i18next.changeLanguage>;

describe('settings', () => {
  const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');

  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          settings: {
            uiWindow: {
              width: 400,
              height: 600,
              isMinimized: false,
            },

            updateMode: UpdateMode.PAGE,
            updateRemote: true,
            updateOnChange: true,
            tokenType: 'object',
            ignoreFirstPartForStyles: false,
            prefixStylesWithThemeName: false,
            inspectDeep: false,
          },
        },
      },
      models,
    });
  });

  it('should be able to set inspectDeep', () => {
    store.dispatch.settings.setInspectDeep(true);
    expect(store.getState().settings.inspectDeep).toBe(true);
  });

  it('should track language changes correctly', () => {
    store.dispatch.settings.setLanguage('fr');
    expect(i18nextMocked).toBeCalledWith('fr');

    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.SET_UI,
      uiWindow: {
        width: 400,
        height: 600,
        isMinimized: false,
      },
      language: 'fr',
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      tokenType: 'object',
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
    });
  });

  it('should be able to set window size', () => {
    store.dispatch.settings.setWindowSize({ width: 1024, height: 768 });
    expect(store.getState().settings.uiWindow).toEqual({
      isMinimized: false,
      width: 1024,
      height: 768,
    });
    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.RESIZE_WINDOW,
      width: 1024,
      height: 768,
    });
  });

  it('should be able to minimize plugin window', () => {
    store.dispatch.settings.setMinimizePluginWindow({ isMinimized: true, width: 40, height: 60 });
    expect(store.getState().settings.uiWindow).toEqual({
      isMinimized: true,
      width: 40,
      height: 60,
    });
    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.RESIZE_WINDOW,
      width: 50,
      height: 50,
    });
  });

  it('should be able to set UI settings', () => {
    store.dispatch.settings.setUISettings({
      uiWindow: {
        width: 1024,
        height: 768,
        isMinimized: false,
      },
      updateMode: UpdateMode.DOCUMENT,
      updateRemote: false,
      updateOnChange: false,
      tokenType: 'object',
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: true,
    } as SettingsState);
    expect(store.getState().settings).toEqual({
      uiWindow: {
        width: 1024,
        height: 768,
        isMinimized: false,
      },
      updateMode: UpdateMode.DOCUMENT,
      updateRemote: false,
      updateOnChange: false,
      tokenType: 'object',
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: true,
    });
  });

  it('should be able to modify window size', () => {
    store.dispatch.settings.triggerWindowChange();
    expect(store.getState().settings).toEqual({
      uiWindow: {
        width: 400,
        height: 600,
        isMinimized: false,
      },
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      tokenType: 'object',
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
    });
    expect(messageSpy).toBeCalledWith({
      type: AsyncMessageTypes.SET_UI,
      uiWindow: {
        width: 400,
        height: 600,
        isMinimized: false,
      },
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      tokenType: 'object',
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
    });
  });

  it('should be able to set update mode', () => {
    store.dispatch.settings.setUpdateMode(UpdateMode.DOCUMENT);
    expect(store.getState().settings.updateMode).toBe(UpdateMode.DOCUMENT);
  });

  it('should be able to set updateRemote', () => {
    store.dispatch.settings.setUpdateRemote(true);
    expect(store.getState().settings.updateRemote).toEqual(true);
  });

  it('should be able to set updateOnChange', () => {
    store.dispatch.settings.setUpdateOnChange(true);
    expect(store.getState().settings.updateOnChange).toEqual(true);
  });

  it('should be able to set token type', () => {
    store.dispatch.settings.setTokenType('array');
    expect(store.getState().settings.tokenType).toEqual('array');
  });

  it('should be able to set ignoreFirstPartForStyles', () => {
    store.dispatch.settings.setIgnoreFirstPartForStyles(true);
    expect(store.getState().settings.ignoreFirstPartForStyles).toEqual(true);
  });

  it('should be able to set baseFontSize', () => {
    store.dispatch.settings.setBaseFontSize('24px');
    expect(store.getState().settings.baseFontSize).toEqual('24px');
  });

  it('should be able to set aliasBaseFontSize', () => {
    store.dispatch.settings.setAliasBaseFontSize('{font.base}');
    expect(store.getState().settings.aliasBaseFontSize).toEqual('{font.base}');
  });
});
