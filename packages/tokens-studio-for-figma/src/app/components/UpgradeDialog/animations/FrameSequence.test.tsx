import React from 'react';
import { act, render } from '../../../../../tests/config/setupTest';
import FrameSequence from './FrameSequence';

const frames = ['frame-1.svg', 'frame-2.svg', 'frame-3.svg'];

const visibleFrame = (container: HTMLElement) => [...container.querySelectorAll('img')]
  .findIndex((img) => img.dataset.state === 'visible');

describe('FrameSequence', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loops through its frames', () => {
    const { container } = render(<FrameSequence frames={frames} />);
    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(visibleFrame(container)).toBe(0);

    act(() => { jest.advanceTimersByTime(1600); });
    expect(visibleFrame(container)).toBe(1);

    act(() => { jest.advanceTimersByTime(3200); });
    expect(visibleFrame(container)).toBe(0);
  });

  it('stays on the first frame for people who prefer reduced motion', () => {
    const { matchMedia } = window;
    window.matchMedia = jest.fn().mockReturnValue({
      matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn(),
    });

    const { container } = render(<FrameSequence frames={frames} />);
    act(() => { jest.advanceTimersByTime(5000); });
    expect(visibleFrame(container)).toBe(0);

    window.matchMedia = matchMedia;
  });
});
