import React from 'react';
import { Provider } from 'react-redux';
import { MotionConfig } from 'framer-motion';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { act, createMockStore, render } from '../../../../../tests/config/setupTest';
import { ThemeStyleManagementForm } from '../ThemeStyleManagementForm';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

const mockResolveStyleInfoHandler = jest.fn(async () => ({
  resolvedValues: [
    {
      id: 'S:1234',
      key: 'S:1234',
      name: 'colors/brand/primary',
    },
    {
      id: 'S:2345',
      key: 'S:2345',
      name: 'typography/heading/h1',
    },
    {
      id: 'S:3456',
      failedToResolve: true,
    },
  ],
}));

const mockAttachLocalStylesToTheme = jest.fn(async () => ({
  id: 'light',
  name: 'Light',
  selectedTokenSets: {},
  $figmaStyleReferences: {
    'colors.brand.primary': 'S:1234',
    'typography.heading.h1': 'S:2345',
  },
}));

describe('ThemeStyleManagementForm', () => {
  it('should work', async () => {
    const runAfter = [
      AsyncMessageChannel.PluginInstance.connect(),
      AsyncMessageChannel.ReactInstance.connect(),
    ];

    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.RESOLVE_STYLE_INFO, mockResolveStyleInfoHandler);
    AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.ATTACH_LOCAL_STYLES_TO_THEME, mockAttachLocalStylesToTheme);

    const store = createMockStore({
      tokenState: {
        tokens: {
          light: [
            {
              name: 'colors.brand.primary',
              value: '#ffffff',
              type: TokenTypes.COLOR,
            },
            {
              name: 'typography.heading.h1',
              value: '',
              type: TokenTypes.TYPOGRAPHY,
            },
            {
              name: 'shadows.lg',
              value: '',
              type: TokenTypes.BOX_SHADOW,
            },
          ],
        },
        themes: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              light: TokenSetStatus.ENABLED,
            },
            $figmaStyleReferences: {
              'colors.brand.primary': 'S:1234',
              'typography.heading.h1': 'S:2345',
              'shadows.lg': 'S:3456',
            },
          },
        ],
      },
    });

    const result = render(
      <MotionConfig reducedMotion="always">
        <Provider store={store}>
          <ThemeStyleManagementForm id="light" />
        </Provider>
      </MotionConfig>,
    );

    expect(mockResolveStyleInfoHandler).toBeCalledTimes(1);

    const toggle = (await result.findAllByTestId('accordion-toggle'))[2];
    act(() => toggle.click());

    const unlink = await result.findAllByTestId('themestylemanagementcategorystyleentry-unlink');
    act(() => unlink[0].click());
    expect(store.getState().tokenState.themes[0].$figmaStyleReferences).toEqual({
      'colors.brand.primary': 'S:1234',
      'typography.heading.h1': 'S:2345',
    });

    const attachLocalStyles = (await result.findAllByText('Attach local styles'))[0];
    attachLocalStyles.click();
    expect(mockAttachLocalStylesToTheme).toBeCalledTimes(1);

    runAfter.forEach((fn) => fn());
  });
});
