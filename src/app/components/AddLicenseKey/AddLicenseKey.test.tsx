import React from 'react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import {
  createMockStore, fireEvent, render, resetStore, screen, waitFor,
} from '../../../../tests/config/setupTest';
import AddLicenseKey from './AddLicenseKey';
import {
  LICENSE_ERROR_MESSAGE,
  LICENSE_FOR_ERROR_RESPONSE,
  LICENSE_FOR_VALID_RESPONSE,
  LICENSE_FOR_DETACH_ERROR_RESPONSE,
} from '@/mocks/handlers';
import { AddLicenseSource } from '@/app/store/models/userState';
import ConfirmDialog from '../ConfirmDialog';
import * as notifiers from '@/plugin/notifiers';

// Hide log calls unless they are expected. This is mainly related to react-modal
jest.spyOn(console, 'error').mockImplementation(() => { });

jest.mock('launchdarkly-react-client-sdk', () => ({
  LDProvider: (props: React.PropsWithChildren<unknown>) => props.children,
  useLDClient: () => ({
    identify: () => Promise.resolve(),
  }),
  useFlags: () => ({}),
}));

describe('Add license key', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AddLicenseKey />);

    const addKeyButton = screen.getByRole('button', { name: /add license key/i });
    const removeKeyButton = screen.queryByRole('button', {
      name: /remove key/i,
    });

    expect(removeKeyButton).not.toBeInTheDocument();
    expect(addKeyButton).toBeDisabled();
  });

  it('User can type in the licensseKey input', async () => {
    const licenseKey = 'c421c4-c4214c21-c421c421-c421c1';
    const user = userEvent.setup();
    render(<AddLicenseKey />);

    const input = screen.getByTestId('settings-license-key-input') as HTMLInputElement;
    const addKeyButton = screen.getByRole('button', { name: /add license key/i });

    await user.type(input, licenseKey);

    expect(addKeyButton).not.toBeDisabled();
    expect(input.value).toBe(licenseKey);
  });

  it('User can paste the licenseKey in the input', async () => {
    const licenseKey = 'c421c4-c4214c21-c421c421-c421c1';
    const user = userEvent.setup();
    render(<AddLicenseKey />);

    const input = screen.getByTestId('settings-license-key-input') as HTMLInputElement;

    await user.click(input);
    await user.paste(licenseKey);

    expect(input.value).toBe(licenseKey);
  });

  it('Shows the backend error when added license is not valid', async () => {
    const mockStore = createMockStore({});
    const user = userEvent.setup();
    render(
      <Provider store={mockStore}>
        <AddLicenseKey />
      </Provider>,
    );

    const input = screen.getByTestId('settings-license-key-input') as HTMLInputElement;
    const addLicenseKeyButton = screen.getByRole('button', { name: /add license key/i });

    await user.type(input, LICENSE_FOR_ERROR_RESPONSE);
    await user.click(addLicenseKeyButton);

    const regExError = new RegExp(LICENSE_ERROR_MESSAGE, 'i');
    const errorMessage = await screen.findByText(regExError);

    expect(errorMessage).toBeInTheDocument();
  });

  it('Adds the license key and hides the previous error message if the license is valid', async () => {
    const mockStore = createMockStore({});

    let result: ReturnType<typeof render>;

    await act(async () => {
      result = render(
        <Provider store={mockStore}>
          <AddLicenseKey />
        </Provider>,
      );
    });

    await act(async () => {
      const licenseKeyInput = (await result.findByTestId('settings-license-key-input')) as HTMLInputElement;
      fireEvent.change(licenseKeyInput, {
        target: { value: LICENSE_FOR_ERROR_RESPONSE },
      });
      expect(licenseKeyInput.value).toEqual(LICENSE_FOR_ERROR_RESPONSE);

      const addLicenseKeyButton = await result.findByText('Add license key');
      addLicenseKeyButton.click();

      const errorMessage = await result.findByText(LICENSE_ERROR_MESSAGE);
      expect(errorMessage).toBeInTheDocument();
    });

    await act(async () => {
      const licenseKeyInput = (await result.findByTestId('settings-license-key-input')) as HTMLInputElement;
      fireEvent.change(licenseKeyInput, {
        target: { value: LICENSE_FOR_VALID_RESPONSE },
      });
      expect(licenseKeyInput.value).toEqual(LICENSE_FOR_VALID_RESPONSE);
    });
  });

  it('User should be able to remove a key if its not valid', async () => {
    const mockStore = createMockStore({});

    let result: ReturnType<typeof render>;

    await act(async () => {
      result = render(
        <Provider store={mockStore}>
          <AddLicenseKey />
        </Provider>,
      );
    });

    await act(async () => {
      const licenseKeyInput = (await result.findByTestId('settings-license-key-input')) as HTMLInputElement;
      fireEvent.change(licenseKeyInput, {
        target: { value: LICENSE_FOR_ERROR_RESPONSE },
      });
      expect(licenseKeyInput.value).toEqual(LICENSE_FOR_ERROR_RESPONSE);

      const addLicenseKeyButton = await result.findByText('Add license key');
      addLicenseKeyButton.click();

      const errorMessage = await result.findByText(LICENSE_ERROR_MESSAGE);
      expect(errorMessage).toBeInTheDocument();

      const removeKeyButton = await result.findByText('Remove key');
      expect(removeKeyButton).toBeInTheDocument();
      expect(removeKeyButton).not.toBeDisabled();
    });
  });

  it('Should prompt the user when the user tries to remove the key', async () => {
    const mockStore = createMockStore({});

    let result: ReturnType<typeof render>;

    await act(async () => {
      result = render(
        <Provider store={mockStore}>
          <ConfirmDialog />
          <AddLicenseKey />
        </Provider>,
      );
    });

    await act(async () => {
      await mockStore.dispatch.userState.addLicenseKey({
        key: LICENSE_FOR_VALID_RESPONSE,
        source: AddLicenseSource.UI,
      });
    });

    await act(async () => {
      const removeKeyButton = await result.findByRole('button', {
        name: /remove key/i,
      });
      expect(removeKeyButton).not.toBeDisabled();
      removeKeyButton.click();
      expect(screen.getByText(/Are you sure you want to remove your license key?/i)).toBeInTheDocument();
    });
  });

  it('Should succesfully remove a license key if the user confirms the action', async () => {
    const mockStore = createMockStore({});

    let result: ReturnType<typeof render>;

    await act(async () => {
      result = render(
        <Provider store={mockStore}>
          <ConfirmDialog />
          <AddLicenseKey />
        </Provider>,
      );
    });

    await act(async () => {
      await mockStore.dispatch.userState.addLicenseKey({
        key: LICENSE_FOR_VALID_RESPONSE,
        source: AddLicenseSource.UI,
      });
    });

    await act(async () => {
      const removeKeyButton = await result.findByRole('button', {
        name: /remove key/i,
      });
      expect(removeKeyButton).not.toBeDisabled();
      removeKeyButton.click();
    });

    await act(async () => {
      const confirmButton = await result.findByRole('button', {
        name: /remove license key/i,
      });
      confirmButton.click();

      const input = (await result.getByTestId('settings-license-key-input')) as HTMLInputElement;

      const removeKeyButton = await result.findByRole('button', {
        name: /remove key/i,
      });

      await waitFor(() => {
        expect(input.value).toEqual('');
        expect(removeKeyButton).not.toBeInTheDocument();
      });
    });
  });

  it('Should notify the ui if the license removal failed', async () => {
    const mockStore = createMockStore({});
    const notifyToUISpy = jest.spyOn(notifiers, 'notifyToUI');
    let result: ReturnType<typeof render>;

    await act(async () => {
      result = render(
        <Provider store={mockStore}>
          <ConfirmDialog />
          <AddLicenseKey />
        </Provider>,
      );
    });

    await act(async () => {
      await mockStore.dispatch.userState.addLicenseKey({
        key: LICENSE_FOR_DETACH_ERROR_RESPONSE,
        source: AddLicenseSource.UI,
      });
    });

    await act(async () => {
      const removeKeyButton = await result.findByRole('button', {
        name: /remove key/i,
      });
      expect(removeKeyButton).not.toBeDisabled();
      removeKeyButton.click();
    });

    await act(async () => {
      const confirmButton = await result.findByRole('button', {
        name: /remove license key/i,
      });
      confirmButton.click();
    });

    await waitFor(() => {
      notifyToUISpy.mockReturnValueOnce();
      expect(notifyToUISpy).toBeCalledWith('Error removing license, please contact support', { error: true });
    });
  });

  it('If the key is invalid, The license key should be removed without confirmation and remove key should not be visible anymore', async () => {
    const mockStore = createMockStore({});
    let result: ReturnType<typeof render>;

    await act(async () => {
      result = render(
        <Provider store={mockStore}>
          <ConfirmDialog />
          <AddLicenseKey />
        </Provider>,
      );
    });

    await act(async () => {
      await mockStore.dispatch.userState.addLicenseKey({
        key: LICENSE_FOR_ERROR_RESPONSE,
        source: AddLicenseSource.UI,
      });
    });

    await act(async () => {
      const removeKeyButton = await result.findByRole('button', {
        name: /remove key/i,
      });
      expect(removeKeyButton).not.toBeDisabled();
      removeKeyButton.click();
    });

    await act(async () => {
      const confirmaModal = result.queryByText(/are you sure you want to remove your license key\?/i);
      expect(confirmaModal).toBeNull();
      const input = screen.getByTestId('settings-license-key-input') as HTMLInputElement;
      expect(input.value).toBe('');

      const removeKeyButton = result.queryByRole('button', {
        name: /remove key/i,
      });
      expect(removeKeyButton).toBeNull();
    });
  });
});
