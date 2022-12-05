import {
  track, identify, setUserData, initializeAnalytics,
} from './analytics';
import {
  mockTrack, mockInit, mockIdentify, mockPeopleSet,
} from '../../tests/__mocks__/mixpanelMock';
import * as pjs from '../../package.json';

describe('without mixpanel env', () => {
  it('should not track when mixpanel env isnt set', () => {
    process.env.MIXPANEL_ACCESS_TOKEN = '';

    initializeAnalytics();
    track('test', { data: 'foo' });
    identify({ userId: '123456', figmaId: 'figma-123', name: 'John Doe' });
    setUserData({ likes: 'Apples' });
    expect(mockInit).not.toBeCalled();
    expect(mockTrack).not.toBeCalled();
    expect(mockIdentify).not.toBeCalled();
    expect(mockPeopleSet).not.toBeCalled();
  });
});
describe('with mixpanel env', () => {
  beforeAll(() => {
    process.env.MIXPANEL_ACCESS_TOKEN = '123';
  });

  describe('track', () => {
    it('should track when called', () => {
      track('test', { data: 'foo' });
      expect(mockTrack).toBeCalledWith('test', { data: 'foo' });
    });
  });
  describe('identify', () => {
    it('should identify user', () => {
      identify({ userId: '123456', figmaId: 'figma-123', name: 'John Doe' });
      expect(mockIdentify).toBeCalledWith('figma-123');
      expect(mockPeopleSet).toBeCalledWith({
        USER_ID: '123456',
        FIGMA_USER_ID: 'figma-123',
        NAME: 'John Doe',
        version: pjs.plugin_version,
      });
    });
  });
  describe('setUserData', () => {
    it('should append user data', () => {
      setUserData({ likes: 'Apples' });
      expect(mockPeopleSet).toBeCalledWith({ likes: 'Apples' });
    });
  });
  describe('initializeAnalytics', () => {
    it('should initialize mixpanel', () => {
      initializeAnalytics();
      expect(mockInit).toBeCalled();
    });
  });
});
