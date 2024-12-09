import React from 'react';
import { render, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import ProBadge from './ProBadge';

describe('ProBadge', () => {
  it('displays get pro badge if user is on free plan', () => {
    const { getByText } = render(<ProBadge campaign="test" />, { store });
    expect(getByText('getPro')).toBeInTheDocument();
  });

  it('displays pro badge if user is on pro plan', () => {
    const { getByText, queryByText } = render(<ProBadge campaign="test" />, { store });
    store.dispatch.userState.setLicenseKey('test-key-123');

    waitFor(() => {
      expect(queryByText('getPro')).not.toBeInTheDocument();
      expect(getByText('pro')).toBeInTheDocument();
    });
  });
});
