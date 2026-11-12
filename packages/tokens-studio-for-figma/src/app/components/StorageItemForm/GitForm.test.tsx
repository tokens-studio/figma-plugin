import React from 'react';
import { fireEvent, render } from '../../../../tests/config/setupTest';
import { StorageProviderType } from '@/constants/StorageProviderType';
import GitForm from './GitForm';
import { GitFormProvider } from './gitFormConfig';

const fields = {
  provider: StorageProviderType.GITEA as const,
  name: 'Example repository',
  id: 'owner/repo',
  branch: 'main',
  filePath: 'tokens.json',
  baseUrl: 'https://git.example.com/gitea/',
  secret: 'test-token',
};

it.each([
  [StorageProviderType.GITHUB, 'gitHubExplained', 'readMoreGitHub'],
  [StorageProviderType.GITLAB, 'gitLabExplained', 'readMoreGitLab'],
] as const)('preserves optional custom URLs and setup copy for %s', (provider, descriptionKey, readMoreKey) => {
  const onSubmit = jest.fn();
  const result = render(<GitForm values={{ ...fields, provider, baseUrl: '' }} onChange={jest.fn()} onSubmit={onSubmit} onCancel={jest.fn()} />);
  expect(result.getByText(descriptionKey)).toBeInTheDocument();
  expect(result.getByText(readMoreKey)).toHaveAttribute('href', `https://docs.tokens.studio/sync/${provider}?ref=addprovider`);
  expect(result.getByLabelText('baseUrl')).not.toBeRequired();
  expect(result.queryByText('providers.gitea.cors')).not.toBeInTheDocument();
  fireEvent.click(result.getByRole('button', { name: 'save' }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ provider, baseUrl: '' }));
});

it.each([StorageProviderType.GITHUB, StorageProviderType.GITLAB, StorageProviderType.GITEA] as GitFormProvider[])('masks the token for %s', (provider) => {
  const result = render(<GitForm values={{ ...fields, provider }} onChange={jest.fn()} onSubmit={jest.fn()} onCancel={jest.fn()} />);
  expect(result.getByLabelText('pat')).toHaveAttribute('type', 'password');
});
