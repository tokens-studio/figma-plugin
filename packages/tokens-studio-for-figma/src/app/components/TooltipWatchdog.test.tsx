import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../tests/config/setupTest';
import TooltipWatchdog from './TooltipWatchdog';

// These tests lock in the Radix internals that TooltipWatchdog depends on. If a Radix
// upgrade renames the `tooltip.open` event, changes the tooltip `role`, or changes the
// open-trigger `data-state` values, the watchdog would silently stop working — and one
// of these assertions will fail instead.
function renderOpenTooltip() {
  return render(
    <Tooltip.Provider>
      <TooltipWatchdog />
      <Tooltip.Root defaultOpen delayDuration={0}>
        <Tooltip.Trigger data-testid="trigger">hover me</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>tooltip label</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>,
  );
}

describe('TooltipWatchdog', () => {
  it('an open Radix tooltip exposes the contract the watchdog relies on', async () => {
    const { getByTestId, findByRole } = renderOpenTooltip();

    // 1. Open tooltip content is discoverable via role="tooltip".
    await findByRole('tooltip');
    // 2. The open trigger carries a data-state the watchdog whitelists.
    expect(['instant-open', 'delayed-open']).toContain(getByTestId('trigger').getAttribute('data-state'));
  });

  it('closes a tooltip when the pointer moves away from its trigger', async () => {
    const { queryByRole, findByRole } = renderOpenTooltip();
    await findByRole('tooltip');

    fireEvent.pointerMove(document.body);

    await waitFor(() => expect(queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('keeps the tooltip while the pointer is still over its trigger', async () => {
    const { getByTestId, findByRole, queryByRole } = renderOpenTooltip();
    await findByRole('tooltip');

    fireEvent.pointerMove(getByTestId('trigger'));

    // Give any (unwanted) close a chance to flush, then assert it stayed open.
    await new Promise((resolve) => { setTimeout(resolve, 50); });
    expect(queryByRole('tooltip')).toBeInTheDocument();
  });
});
