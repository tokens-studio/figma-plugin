import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { createMockStore } from '../../../../tests/config/setupTest';
import { Subscription } from './Subscription';

describe('Subscription', () => {
  it('should render subscription page with license key component', () => {
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <Subscription />
      </Provider>,
    );
    expect(result.container).toBeInTheDocument();
  });
});
