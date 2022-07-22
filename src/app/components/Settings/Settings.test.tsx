import React from 'react';
import Settings from './Settings';
import {
  render, screen, resetStore, fireEvent,
} from '../../../../tests/config/setupTest';
import { store } from '../../store';

describe('Settings Component', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Settings />);
  });

  it('can toggle ignoreFirstPartForStyles', () => {
    render(<Settings />);

    const checkbox = screen.getByTestId('ignoreFirstPartForStyles');
    fireEvent.click(checkbox, {
      target: checkbox,
    });

    expect(store.getState().settings.ignoreFirstPartForStyles).toBe(true);
  });

  it('can toggle prefixStylesWithThemeName', () => {
    render(<Settings />);

    const checkbox = screen.getByTestId('prefixStylesWithThemeName');
    fireEvent.click(checkbox, {
      target: checkbox,
    });

    expect(store.getState().settings.prefixStylesWithThemeName).toBe(true);
  });
});
