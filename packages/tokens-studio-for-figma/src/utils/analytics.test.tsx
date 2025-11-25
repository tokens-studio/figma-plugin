import {
  track, identify, setUserData, initializeAnalytics,
} from './analytics';
import {
  mockTrack, mockInit, mockIdentify, mockPeopleSet,
} from '../../tests/__mocks__/mixpanelMock';
import pjs from '../../package.json';

describe('without mixpanel env', () => {
  it('should not track when mixpanel env isnt set', () => {
    process.env.MIXPANEL_ACCESS_TOKEN = '';

    initializeAnalytics();
    track('test', { data: 'foo' });
    identify({ userId: '123456', figmaId: 'figma-123', name: 'John Doe' });
    setUserData({ likes: 'Apples' });
    expect(mockInit).not.toHaveBeenCalled();
    expect(mockTrack).not.toHaveBeenCalled();
    expect(mockIdentify).not.toHaveBeenCalled();
    expect(mockPeopleSet).not.toHaveBeenCalled();
  });
});
describe('with mixpanel env', () => {
  beforeAll(() => {
    process.env.MIXPANEL_ACCESS_TOKEN = '123';
  });

  describe('track', () => {
    it('should track when called', () => {
      track('test', { data: 'foo' });
      expect(mockTrack).toHaveBeenCalledWith('test', { data: 'foo' });
    });
  });
  describe('identify', () => {
    it('should identify user', () => {
      identify({ userId: '123456', figmaId: 'figma-123', name: 'John Doe' });
      // The expected hash for 'figma-123' with the current secret
      expect(mockIdentify).toHaveBeenCalledWith('1244d333afb1ab6c245fa8a6047ae67e158eee7faf4f21cb7ff0928667432ee7');
      expect(mockPeopleSet).toHaveBeenCalledWith({
        USER_ID: '3d8ce42cd62e71dd507338d5f41c9005fbeda2ba0b9d3cf273bb26b79eaec6a7',
        FIGMA_USER_ID: '1244d333afb1ab6c245fa8a6047ae67e158eee7faf4f21cb7ff0928667432ee7',
        version: pjs.version,
      });
    });
  });
  describe('setUserData', () => {
    it('should append user data', () => {
      setUserData({ likes: 'Apples' });
      expect(mockPeopleSet).toHaveBeenCalledWith({ likes: 'Apples' });
    });
  });
  describe('initializeAnalytics', () => {
    it('should initialize mixpanel', () => {
      initializeAnalytics();
      expect(mockInit).toHaveBeenCalled();
    });
  });
});
