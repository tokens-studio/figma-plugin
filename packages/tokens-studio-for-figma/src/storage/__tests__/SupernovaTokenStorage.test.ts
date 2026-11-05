import { Supernova } from '@supernovaio/supernova-sdk';
import { SupernovaTokenStorage } from '../SupernovaTokenStorage';

jest.mock('@supernovaio/supernova-sdk');

describe('SupernovaTokenStorage', () => {
  it.each([
    ['cloud.supernova.io', 'https://api.supernova.io/api'],
    ['app.supernova.io', 'https://api.supernova.io/api'],
    ['cloud.dev.supernova.io', 'https://api.dev.supernova.io/api'],
    ['app.dev.supernova.io', 'https://api.dev.supernova.io/api'],
    ['cloud.demo.supernova.io', 'https://api.demo.supernova.io/api'],
    ['app.demo.supernova.io', 'https://api.demo.supernova.io/api'],
    ['cloud.staging.supernova.io', 'https://api.staging.supernova.io/api'],
    ['app.staging.supernova.io', 'https://api.staging.supernova.io/api'],
  ])('maps %s to its API instance', (hostname, apiUrl) => {
    expect(() => new SupernovaTokenStorage(`https://${hostname}/ws/1/ds/2`, '{}', 'secret')).not.toThrow();
    expect(Supernova).toHaveBeenCalledWith('secret', apiUrl, null);
  });

  it.each([
    'https://example.com/cloud.supernova.io/ws/1/ds/2',
    'https://cloud.supernova.io.example.com/ws/1/ds/2',
    'https://cloudxsupernovaxio.example.com/ws/1/ds/2',
  ])('rejects %s', (url) => {
    expect(() => new SupernovaTokenStorage(url, '{}', 'secret')).toThrow('Unsupported Supernova URL');
  });
});
