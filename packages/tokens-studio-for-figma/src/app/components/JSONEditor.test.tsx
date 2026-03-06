import React from 'react';
import { render, resetStore, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import JSONEditor from './JSONEditor';

const mockSetDiagnosticsOptions = jest.fn();
const mockUpdateOptions = jest.fn();

jest.mock('@monaco-editor/react', () => {
  const MockMonacoEditor = ({ options, onMount }: { options: { readOnly?: boolean }; onMount?: (editor: { updateOptions: (opts: { readOnly: boolean }) => void }) => void }) => {
    onMount?.({ updateOptions: mockUpdateOptions });
    return <div data-testid="monaco-editor" data-readonly={String(Boolean(options?.readOnly))} />;
  };

  return {
    __esModule: true,
    default: MockMonacoEditor,
    useMonaco: () => ({
      languages: {
        json: {
          jsonDefaults: {
            setDiagnosticsOptions: mockSetDiagnosticsOptions,
          },
        },
      },
    }),
  };
});

describe('JSONEditor', () => {
  beforeEach(() => {
    resetStore();
    mockSetDiagnosticsOptions.mockClear();
    mockUpdateOptions.mockClear();
  });

  it('keeps editor writable when editing is allowed', async () => {
    const result = render(<JSONEditor stringTokens="{}" handleChange={jest.fn()} />, { store });

    expect(result.getByTestId('monaco-editor')).toHaveAttribute('data-readonly', 'false');
    await waitFor(() => {
      expect(mockUpdateOptions).toHaveBeenCalledWith({ readOnly: false });
    });
  });

  it('updates Monaco readOnly option when permissions change', async () => {
    const result = render(<JSONEditor stringTokens="{}" handleChange={jest.fn()} />, { store });
    store.dispatch.tokenState.setEditProhibited(true);

    await waitFor(() => {
      expect(result.getByTestId('monaco-editor')).toHaveAttribute('data-readonly', 'true');
      expect(mockUpdateOptions).toHaveBeenLastCalledWith({ readOnly: true });
    });
  });
});
