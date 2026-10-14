import React from 'react';
import {
  act, fireEvent, render,
} from '../../../../tests/config/setupTest';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenTooltip } from './TokenTooltip';

const renderCounts: Record<string, number> = {};

const CountingTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>(
  ({ label, ...props }, ref) => {
    renderCounts[label] = (renderCounts[label] ?? 0) + 1;
    return <button type="button" ref={ref} {...props}>{label}</button>;
  },
);

const tokenA: SingleToken = { name: 'size.a', value: '4', type: TokenTypes.SIZING };
const tokenB: SingleToken = { name: 'size.b', value: '8', type: TokenTypes.SIZING };

describe('TokenTooltip', () => {
  it('opening one token tooltip does not re-render the other token tooltips', async () => {
    const { getByText, findByRole } = render(
      <>
        <TokenTooltip token={tokenA}><CountingTrigger label="a" /></TokenTooltip>
        <TokenTooltip token={tokenB}><CountingTrigger label="b" /></TokenTooltip>
      </>,
    );
    const rendersOfB = renderCounts.b;

    fireEvent.pointerMove(getByText('a'));
    await findByRole('tooltip');
    // let the tooltip provider settle after the open
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 20); });
    });

    expect(renderCounts.b).toBe(rendersOfB);
  });
});
