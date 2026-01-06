import crypto from 'crypto';
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
  const TEST_SECRET = 'test-secret-for-hashing';
  beforeAll(() => {
    process.env.MIXPANEL_ACCESS_TOKEN = '123';
    process.env.FIGMA_ID_HASH_SECRET = TEST_SECRET;
  });

  describe('track', () => {
    it('should track when called', () => {
      track('test', { data: 'foo' });
      expect(mockTrack).toHaveBeenCalledWith('test', { data: 'foo' });
    });
  });
  describe('identify', () => {
    it('should identify user', () => {
      const expectedFigmaHash = crypto.createHmac('sha256', TEST_SECRET).update('figma-123').digest('hex');
      const expectedUserIdHash = crypto.createHmac('sha256', TEST_SECRET).update('123456').digest('hex');

      identify({ userId: '123456', figmaId: 'figma-123' });
      expect(mockIdentify).toHaveBeenCalledWith(expectedFigmaHash);
      expect(mockPeopleSet).toHaveBeenCalledWith({
        USER_ID: expectedUserIdHash,
        FIGMA_USER_ID: expectedFigmaHash,
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
