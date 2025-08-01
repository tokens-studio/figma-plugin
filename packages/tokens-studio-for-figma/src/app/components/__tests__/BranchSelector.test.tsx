import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// Simple test to verify the enhanced BranchSelector can be imported and used with cmdk
describe('BranchSelector with cmdk', () => {
  it('can import cmdk and BranchSelector without errors', () => {
    // Test that cmdk can be imported
    expect(() => require('cmdk')).not.toThrow();
    
    // Test that the enhanced BranchSelector can be imported
    expect(() => require('../BranchSelector')).not.toThrow();
  });

  it('includes CSS styles for branch command items', () => {
    // Test that the CSS file exists
    expect(() => require('../BranchSelector.css')).not.toThrow();
  });
});