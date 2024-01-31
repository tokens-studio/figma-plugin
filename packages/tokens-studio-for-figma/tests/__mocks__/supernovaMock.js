jest.mock('@supernovaio/supernova-sdk', () => ({
  DesignSystem: jest.fn(),
  DesignSystemVersion: jest.fn(),
  Supernova: jest.fn(),
}));
