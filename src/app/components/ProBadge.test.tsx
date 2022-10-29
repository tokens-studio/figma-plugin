import React from 'react';
import { render } from '../../../tests/config/setupTest';
import { store } from '../store';
import ProBadge from './ProBadge';

describe('ProBadge', () => {
  it('displays get pro badge if user is on free plan', () => {
    const { getByText } = render(<ProBadge />, { store });
    expect(getByText('Get Pro')).toBeInTheDocument();
  });

  it('displays pro badge if user is on pro plan', () => {
    const { getByText, queryByText } = render(<ProBadge />, { store });
    store.dispatch.userState.setLicenseKey('test-key-123');

    expect(queryByText('Get Pro')).not.toBeInTheDocument();

    expect(getByText('Pro')).toBeInTheDocument();
  });
});
