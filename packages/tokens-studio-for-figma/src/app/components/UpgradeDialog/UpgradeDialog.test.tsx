import React from 'react';
import userEvent from '@testing-library/user-event';
import { act, render, screen } from '../../../../tests/config/setupTest';
import UpgradeDialog from './UpgradeDialog';
import { useUpgradeDialogStore } from '@/app/store/useUpgradeDialogStore';
import { getTrialUrl } from './upgradeFeatures';

describe('UpgradeDialog', () => {
  beforeEach(() => {
    global.open = jest.fn();
  });

  afterEach(() => {
    act(() => useUpgradeDialogStore.getState().closeUpgradeDialog());
  });

  it('renders nothing until a feature is requested', () => {
    render(<UpgradeDialog />);
    expect(screen.queryByTestId('upgrade-dialog')).not.toBeInTheDocument();
  });

  it('steps through the feature slides and ends on the trial slide', async () => {
    render(<UpgradeDialog />);
    act(() => useUpgradeDialogStore.getState().openUpgradeDialog('compositionTokens', 'test'));

    expect(await screen.findByTestId('upgrade-dialog-media-compositionTokens-1')).toBeInTheDocument();
    expect(screen.queryByText('previous')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('upgrade-dialog-next'));
    await userEvent.click(screen.getByTestId('upgrade-dialog-next'));

    expect(screen.getByTestId('upgrade-dialog-media-plus')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-dialog-start-trial')).toBeInTheDocument();
    expect(screen.queryByTestId('upgrade-dialog-next')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('previous'));
    expect(screen.getByTestId('upgrade-dialog-media-compositionTokens-2')).toBeInTheDocument();
  });

  it('opens the trial page and closes when starting the trial', async () => {
    render(<UpgradeDialog />);
    act(() => useUpgradeDialogStore.getState().openUpgradeDialog('tokenFlow'));

    await userEvent.click(await screen.findByTestId('upgrade-dialog-next'));
    await userEvent.click(screen.getByTestId('upgrade-dialog-start-trial'));

    expect(global.open).toHaveBeenCalledWith(getTrialUrl('tokenFlow'), '_blank');
    expect(useUpgradeDialogStore.getState().feature).toBeNull();
  });
});
