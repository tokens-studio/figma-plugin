import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import {
  act, createMockStore, render,
} from '../../../tests/config/setupTest';
import ApplySelector from './ApplySelector';

const mockStore = createMockStore({});
const renderStore = () => render(
  <Provider store={mockStore}>
    <ApplySelector />
  </Provider>,
);

describe('ApplySelector', () => {
  it('should work', async () => {
    const result = renderStore();

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-on-change');
      const updateRemote = result.getByTestId('update-remote');
      const updateStyles = result.getByTestId('update-styles');
      const swapStylesAlpha = result.queryByTestId('swap-styles-alpha');

      expect(updateChanges).toBeInTheDocument();
      expect(updateRemote).toBeInTheDocument();
      expect(updateStyles).toBeInTheDocument();
      expect(swapStylesAlpha).toBeNull();
    });
  });

  it('should call setUpdateMode', async () => {
    const updateModeSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateMode');
    const result = renderStore();

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);
      const applyToDocument = result.getByTestId('apply-to-document');
      await userEvent.click(applyToDocument, { pointerEventsCheck: 0 });
      await userEvent.click(trigger);
      const applyToPage = result.getByTestId('apply-to-page');
      await userEvent.click(applyToPage, { pointerEventsCheck: 0 });
      await userEvent.click(trigger);
      const applyToSelection = result.getByTestId('apply-to-selection');
      await userEvent.click(applyToSelection, { pointerEventsCheck: 0 });
      expect(updateModeSpy).toBeCalledTimes(3);
    });
  });
  it('should call updateOnChanges', async () => {
    const updateOnChangeSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateOnChange');
    const result = renderStore();

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-on-change');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(updateOnChangeSpy).toBeCalledTimes(1);
    });
  });
  it('should call updateRemote', async () => {
    const updateRemoteSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateRemote');
    const result = renderStore();

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-remote');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(updateRemoteSpy).toBeCalledTimes(1);
    });
  });
  it('should call updateStyles', async () => {
    const updateStylesSpy = jest.spyOn(mockStore.dispatch.settings, 'setUpdateStyles');
    const result = renderStore();

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-styles');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(updateStylesSpy).toBeCalledTimes(1);
    });
  });

  it('with swap styles feature flag', async () => {
    process.env.LAUNCHDARKLY_FLAGS = 'swapStylesAlpha';
    const result = renderStore();

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);

      const swapStylesAlpha = result.getByTestId('swap-styles-alpha');
      expect(swapStylesAlpha).toBeInTheDocument();
    });
  });

  it('should call swapStyles with feature flag', async () => {
    process.env.LAUNCHDARKLY_FLAGS = 'swapStylesAlpha';

    const shouldSwapStylesSpy = jest.spyOn(mockStore.dispatch.settings, 'setShouldSwapStyles');
    const result = renderStore();

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('swap-styles-alpha');
      await userEvent.click(updateChanges, { pointerEventsCheck: 0 });
      expect(shouldSwapStylesSpy).toBeCalledTimes(1);
    });
  });
});
