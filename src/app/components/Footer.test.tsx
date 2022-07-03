import React from 'react';
import { render } from '../../../tests/config/setupTest';
import { store } from '../store';
import Footer from './Footer';
import * as pjs from '../../../package.json';

describe('Footer', () => {
  it('displays current version number', () => {
    const { getByText } = render(<Footer />, { store });
    expect(getByText(`V ${pjs.plugin_version}`)).toBeInTheDocument();
  });

  it('displays get pro badge if user is on free plan', () => {
    const { getByText } = render(<Footer />, { store });
    expect(getByText('Get Pro')).toBeInTheDocument();
  });
});
