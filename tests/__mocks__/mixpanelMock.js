export const mockInit = jest.fn();
export const mockIdentify = jest.fn();
export const mockTrack = jest.fn();
export const mockPeopleSet = jest.fn();

jest.mock('mixpanel-figma', () => ({
  init: mockInit,
  identify: mockIdentify,
  track: mockTrack,
  people: {
    set: mockPeopleSet,
  },
}));