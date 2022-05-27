import { StorageProviderType } from '@/constants/StorageProviderType';
import * as generateId from '@/utils/generateId';
import { removeSingleCredential, updateCredentials } from './credentials';

describe('updateCredentials', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const generateIdSpy = jest.spyOn(generateId, 'generateId').mockImplementation(() => 'idMock');

  // Mock id for test

  it('sets credentials when no credentials existed before', async () => {
    const apiObject = {
      id: '123',
      secret: 'foo',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    figma.clientStorage.getAsync
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(JSON.stringify([apiObject]));
    await updateCredentials(apiObject);

    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith(
      'apiProviders',
      JSON.stringify([{ ...apiObject, internalId: 'idMock' }]),
    );
    expect(generateIdSpy).toHaveBeenCalled();
  });

  it('updates credentials when there have been existing', async () => {
    const apiArray = [
      {
        id: '123',
        secret: 'abc',
        name: 'mytokens',
        provider: StorageProviderType.JSONBIN,
      },
    ];
    const newObject = {
      id: '456',
      secret: 'foo',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    const newArray = [
      ...apiArray,
      {
        ...newObject,
        internalId: 'idMock',
      },
    ];
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify(apiArray));
    await updateCredentials(newObject);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify(newArray));
    expect(generateIdSpy).toHaveBeenCalled();
  });

  it('merges credentials when there have been existing that match', async () => {
    const apiArray = [
      {
        id: '123',
        secret: 'abc',
        name: 'mytokens',
        provider: StorageProviderType.JSONBIN,
      },
    ];
    const newObject = {
      id: '123',
      secret: 'abc',
      name: 'my new name',
      provider: StorageProviderType.JSONBIN,
    };
    const newArray = [newObject];
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify(apiArray));
    await updateCredentials(newObject);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify(newArray));
  });

  it('merges credentials when there have been existing that match internalId', async () => {
    const apiArray = [
      {
        id: '123',
        internalId: 'abc',
        secret: 'abc',
        name: 'mytokens',
        provider: StorageProviderType.JSONBIN,
      },
    ];
    const newObject = {
      id: '456',
      internalId: 'abc',
      secret: 'abc',
      name: 'my new name',
      provider: StorageProviderType.JSONBIN,
    };
    const newArray = [newObject];
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify(apiArray));
    await updateCredentials(newObject);
    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify(newArray));
  });
});

describe('removeSingleCredential', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('removes credential if found and only one entry existed', async () => {
    const apiObject = {
      id: '123',
      secret: 'foo',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    const oldArray = [apiObject];
    figma.clientStorage.getAsync.mockResolvedValue(JSON.stringify(oldArray));
    await removeSingleCredential(apiObject);

    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify([]));
  });

  it('removes credential if found and multiple existed', async () => {
    const apiObject = {
      id: '123',
      secret: 'foo',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    const otherObject = {
      id: '456',
      secret: 'bar',
      name: 'mytokens',
      provider: StorageProviderType.JSONBIN,
    };
    const oldArray = [apiObject, otherObject];
    figma.clientStorage.getAsync.mockResolvedValueOnce(JSON.stringify(oldArray));
    await removeSingleCredential(otherObject);

    expect(figma.clientStorage.setAsync).toHaveBeenCalledWith('apiProviders', JSON.stringify([apiObject]));
  });
});
