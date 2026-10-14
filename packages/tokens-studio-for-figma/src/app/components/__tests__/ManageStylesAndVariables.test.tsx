import React from 'react';
import { Provider } from 'react-redux';
import {
  act, createMockStore, fireEvent, render,
} from '../../../../tests/config/setupTest';
import ManageStylesAndVariables from '../ManageStylesAndVariables/ManageStylesAndVariables';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';

const mockConfirm = jest.fn();
const mockRemoveVariablesByKeys = jest.fn();
const mockCreateVariablesFromSets = jest.fn();
const mockCreateStylesFromSelectedTokenSets = jest.fn();
const mockCreateVariablesFromThemes = jest.fn();
const mockCreateStylesFromSelectedThemes = jest.fn();
let mockCanUseThemes = false;

jest.mock('@/app/hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({ confirm: mockConfirm }),
}));

jest.mock('@/app/store/useTokens', () => ({
  __esModule: true,
  default: () => ({
    removeVariablesByKeys: mockRemoveVariablesByKeys,
    createVariablesFromSets: mockCreateVariablesFromSets,
    createStylesFromSelectedTokenSets: mockCreateStylesFromSelectedTokenSets,
    createVariablesFromThemes: mockCreateVariablesFromThemes,
    createStylesFromSelectedThemes: mockCreateStylesFromSelectedThemes,
  }),
}));

jest.mock('@/app/hooks/useCanUseThemes', () => ({
  useCanUseThemes: () => mockCanUseThemes,
}));

const gradient = 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)';

// `hero` resolves to a gradient in the theme and still has a variable; `banner` is
// solid in the theme and only a gradient in a set the theme doesn't use.
const createStore = () => createMockStore({
  tokenState: {
    tokens: {
      core: [{ name: 'brand.gradient', type: TokenTypes.COLOR, value: gradient }],
      'brand-a': [
        { name: 'comp.hero', type: TokenTypes.COLOR, value: '{brand.gradient}' },
        { name: 'comp.banner', type: TokenTypes.COLOR, value: '#ff0000' },
      ],
      'brand-b': [{ name: 'comp.banner', type: TokenTypes.COLOR, value: gradient }],
    },
    themes: [
      {
        id: 'brand-a-theme',
        name: 'Brand A',
        selectedTokenSets: { core: TokenSetStatus.SOURCE, 'brand-a': TokenSetStatus.ENABLED },
        $figmaVariableReferences: { 'comp.hero': 'key-hero', 'comp.banner': 'key-banner' },
      },
      {
        id: 'other-theme',
        name: 'Other',
        selectedTokenSets: {},
        // dangling reference to the same variable, should be cleared too
        $figmaVariableReferences: { 'comp.hero': 'key-hero' },
      },
    ],
  },
});

const renderModal = (store = createStore()) => {
  const setShowModal = jest.fn();
  const disconnectSpy = jest.spyOn(store.dispatch.tokenState, 'disconnectVariableFromTheme').mockImplementation(() => ({}) as any);
  const result = render(
    <Provider store={store}>
      <ManageStylesAndVariables showModal setShowModal={setShowModal} />
    </Provider>,
  );
  const clickExport = async () => {
    await act(async () => {
      fireEvent.click(result.container.ownerDocument.getElementById('pullDialog-button-override') as HTMLElement);
    });
  };
  return {
    store, setShowModal, disconnectSpy, clickExport,
  };
};

describe('ManageStylesAndVariables export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanUseThemes = false;
  });

  it('asks only about tokens that resolve to a gradient in their theme', async () => {
    mockConfirm.mockResolvedValue(false);
    const { clickExport } = renderModal();
    await clickExport();

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    const { choices, secondaryAction } = mockConfirm.mock.calls[0][0];
    expect(choices).toEqual([{ key: 'comp.hero', label: 'comp.hero', enabled: true }]);
    // the test i18n setup returns keys, so just check a skip action is offered
    expect(secondaryAction).toBeTruthy();
  });

  it('aborts the export when the prompt is cancelled', async () => {
    mockConfirm.mockResolvedValue(false);
    const { clickExport, setShowModal, disconnectSpy } = renderModal();
    await clickExport();

    expect(mockRemoveVariablesByKeys).not.toHaveBeenCalled();
    expect(disconnectSpy).not.toHaveBeenCalled();
    expect(setShowModal).not.toHaveBeenCalled();
    expect(mockCreateVariablesFromSets).not.toHaveBeenCalled();
  });

  it('deletes the selected variables, clears their theme references and exports', async () => {
    mockConfirm.mockResolvedValue({ result: true, data: ['comp.hero'] });
    const { clickExport, setShowModal, disconnectSpy } = renderModal();
    await clickExport();

    expect(mockRemoveVariablesByKeys).toHaveBeenCalledWith(['key-hero']);
    expect(disconnectSpy).toHaveBeenCalledTimes(2);
    expect(disconnectSpy).toHaveBeenCalledWith({ id: 'brand-a-theme', key: ['comp.hero'] });
    expect(disconnectSpy).toHaveBeenCalledWith({ id: 'other-theme', key: ['comp.hero'] });
    expect(setShowModal).toHaveBeenCalledWith(false);
    expect(mockCreateVariablesFromSets).toHaveBeenCalled();
    expect(mockCreateStylesFromSelectedTokenSets).toHaveBeenCalled();
  });

  it('keeps every variable and exports when skipped', async () => {
    mockConfirm.mockResolvedValue({ result: true, data: ['comp.hero'], secondary: true });
    const { clickExport, disconnectSpy } = renderModal();
    await clickExport();

    expect(mockRemoveVariablesByKeys).not.toHaveBeenCalled();
    expect(disconnectSpy).not.toHaveBeenCalled();
    expect(mockCreateVariablesFromSets).toHaveBeenCalled();
  });

  it('deletes nothing when every token is unchecked', async () => {
    mockConfirm.mockResolvedValue({ result: true, data: [] });
    const { clickExport, disconnectSpy } = renderModal();
    await clickExport();

    expect(mockRemoveVariablesByKeys).not.toHaveBeenCalled();
    expect(disconnectSpy).not.toHaveBeenCalled();
    expect(mockCreateVariablesFromSets).toHaveBeenCalled();
  });

  it('exports straight away when nothing is stale', async () => {
    const store = createMockStore({
      tokenState: {
        tokens: { global: [{ name: 'color.red', type: TokenTypes.COLOR, value: '#ff0000' }] },
        themes: [{
          id: 'light', name: 'Light', selectedTokenSets: { global: TokenSetStatus.ENABLED }, $figmaVariableReferences: { 'color.red': 'key-red' },
        }],
      },
    });
    const { clickExport } = renderModal(store);
    await clickExport();

    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockCreateVariablesFromSets).toHaveBeenCalled();
  });

  it('exports by themes when themes are available', async () => {
    mockCanUseThemes = true;
    mockConfirm.mockResolvedValue({ result: true, data: [], secondary: true });
    const { clickExport } = renderModal();
    await clickExport();

    expect(mockCreateVariablesFromThemes).toHaveBeenCalled();
    expect(mockCreateStylesFromSelectedThemes).toHaveBeenCalled();
    expect(mockCreateVariablesFromSets).not.toHaveBeenCalled();
  });
});
