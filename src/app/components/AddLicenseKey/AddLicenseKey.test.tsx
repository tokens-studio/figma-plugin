import React from 'react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import {
  render, resetStore, screen, waitFor,
} from '../../../../tests/config/setupTest';
import AddLicenseKey from './AddLicenseKey';
import * as Notifiers from '@/plugin/notifiers';
import {
  LICENSE_ERROR_MESSAGE, LICENSE_FOR_ERROR_RESPONSE, LICENSE_FOR_VALID_RESPONSE,
} from '@/mocks/handlers';
import { store } from '@/app/store';
import { AddLicenseSource } from '@/app/store/models/userState';
import App from '../App';
import { Tabs } from '@/constants/Tabs';

const notifyUISpy = jest.spyOn(Notifiers, 'notifyToUI');

describe('Add license key', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AddLicenseKey />);

    screen.getByRole('textbox');
    screen.getByRole('link', { name: /get pro/i });

    const addKeyButton = screen.getByRole('button', { name: /add license key/i });
    const removeKeyButton = screen.queryByRole('button', {
      name: /remove key/i,
    });

    expect(removeKeyButton).not.toBeInTheDocument();
    expect(addKeyButton).toBeDisabled();
  });

  it('User can type in the licenseKey input', async () => {
    const licenseKey = 'c421c4-c4214c21-c421c421-c421c1';
    const user = userEvent.setup();
    render(<AddLicenseKey />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    const addKeyButton = screen.getByRole('button', { name: /add license key/i });

    await user.type(input, licenseKey);

    expect(addKeyButton).not.toBeDisabled();
    expect(input.value).toBe(licenseKey);
  });

  it('User can paste the licenseKey in the input', async () => {
    const licenseKey = 'c421c4-c4214c21-c421c421-c421c1';
    const user = userEvent.setup();
    render(<AddLicenseKey />);

    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.click(input);
    await user.paste(licenseKey);

    expect(input.value).toBe(licenseKey);
  });

  it('Shows the backend error when added license is not valid and the remove key button', async () => {
    const user = userEvent.setup();
    render(<AddLicenseKey />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    const addLicenseKeyButton = screen.getByRole('button', { name: /add license key/i });

    await user.type(input, LICENSE_FOR_ERROR_RESPONSE);
    await user.click(addLicenseKeyButton);

    const regExError = new RegExp(LICENSE_ERROR_MESSAGE, 'i');
    const errorMessage = await screen.findByText(regExError);
    const removeKeyButton = screen.queryByRole('button', {
      name: /remove key/i,
    });

    expect(errorMessage).toBeInTheDocument();
    expect(removeKeyButton).toBeInTheDocument();
  });

  it('Adds the license key and hides the previous error message if the license is valid', async () => {
    render(<App />);
    const user = userEvent.setup();
    await store.dispatch.userState.addLicenseKey({ key: LICENSE_FOR_ERROR_RESPONSE, source: AddLicenseSource.UI });
    store.dispatch.uiState.setActiveTab(Tabs.SETTINGS);

    const input = await screen.findByRole('textbox') as HTMLInputElement;

    input.setSelectionRange(0, input.value.length, 'forward');
    await user.clear(input);
    await user.type(input, LICENSE_FOR_VALID_RESPONSE);

    expect(input.value).toEqual(LICENSE_FOR_VALID_RESPONSE);

    const updateKeyButton = await screen.findByRole('button', { name: /update key/i });

    expect(updateKeyButton).not.toBeDisabled();

    await user.click(updateKeyButton);

    const regExError = new RegExp(LICENSE_ERROR_MESSAGE, 'i');
    const errorMessage = await screen.findByText(regExError);

    await waitFor(() => {
      expect(errorMessage).not.toBeInTheDocument();
      expect(notifyUISpy).toHaveBeenCalledWith('License added succesfully!');
    });
  });

  it('Should prompt the user when the user tries to remove the key', async () => {
    render(<App />);
    const user = userEvent.setup();
    await store.dispatch.userState.addLicenseKey({ key: LICENSE_FOR_VALID_RESPONSE, source: AddLicenseSource.UI });
    store.dispatch.uiState.setActiveTab(Tabs.SETTINGS);

    const removeKeyButton = await screen.findByRole('button', {
      name: /remove key/i,
    });

    await user.click(removeKeyButton);

    expect(screen.getByText(/Are you sure you want to remove your license key?/i)).toBeInTheDocument();
  });

  it('Should succesfully remove a license key if the user confirms the action', async () => {
    render(<App />);
    const user = userEvent.setup();
    await store.dispatch.userState.addLicenseKey({ key: LICENSE_FOR_VALID_RESPONSE, source: AddLicenseSource.UI });
    store.dispatch.uiState.setActiveTab(Tabs.SETTINGS);

    const removeKeyButton = await screen.findByRole('button', {
      name: /remove key/i,
    });
    const input = await screen.findByRole('textbox') as HTMLInputElement;

    await user.click(removeKeyButton);

    const confirmButton = await screen.findByRole('button', {
      name: /remove license key/i,
    });
    await act(async () => {
      await user.click(confirmButton);
    });

    await waitFor(() => {
      expect(input.value).toEqual('');
      expect(removeKeyButton).not.toBeInTheDocument();
    });
  });

  it('Should show an error message if the license removal failed', async () => {
    const user = userEvent.setup();
    render(<App />);
    await store.dispatch.userState.addLicenseKey({ key: LICENSE_FOR_ERROR_RESPONSE, source: AddLicenseSource.UI });
    store.dispatch.uiState.setActiveTab(Tabs.SETTINGS);

    const input = await screen.findByRole('textbox') as HTMLInputElement;
    const removeKeyButton = await screen.findByRole('button', {
      name: /remove key/i,
    });

    expect(removeKeyButton).not.toBeDisabled();

    await user.click(removeKeyButton);

    const confirmButton = await screen.findByRole('button', {
      name: /remove license key/i,
    });

    await act(async () => {
      await user.click(confirmButton);
    });

    await waitFor(() => {
      expect(input.value).toBe(LICENSE_FOR_ERROR_RESPONSE);
      expect(removeKeyButton).toBeInTheDocument();
      expect(notifyUISpy).toHaveBeenCalledWith('Error removing license, please contact support', { error: true });
    });
  });
});
