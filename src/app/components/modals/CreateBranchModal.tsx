import React from 'react';
import { useSelector } from 'react-redux';
import { GitBranchIcon } from '@primer/octicons-react';
import Modal from '../Modal';
import Heading from '../Heading';
import Button from '../Button';
import Input from '../Input';
import useRemoteTokens from '../../store/remoteTokens';
import {
  activeThemeSelector, apiSelector, localApiStateSelector, usedTokenSetSelector,
} from '@/selectors';
import Stack from '../Stack';
import { isGitProvider } from '@/utils/is';
import type { StorageTypeCredentials } from '@/types/StorageType';
import { ErrorMessage } from '../ErrorMessage';

type Props = {
  isOpen: boolean;
  startBranch: string | null;
  isCurrentChanges: boolean;
  onClose: (arg: boolean) => void;
  onSuccess: (branch: string, branches: string[]) => void;
};

type FormData = {
  branch: string
};

export default function CreateBranchModal({
  isOpen, onClose, onSuccess, startBranch, isCurrentChanges,
}: Props) {
  const {
    addNewBranch, pushTokens, fetchBranches, pullTokens,
  } = useRemoteTokens();

  const localApiState = useSelector(localApiStateSelector);
  const apiData = useSelector(apiSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);

  const [formFields, setFormFields] = React.useState<FormData>({} as FormData);
  const [hasErrored, setHasErrored] = React.useState<boolean>(false);
  const branchInputRef = React.useRef<HTMLInputElement | null>(null);

  /* @lifecycle
  ** set focus on input
  */
  React.useEffect(() => {
    setTimeout(() => {
      branchInputRef.current?.focus();
    }, 200);
  }, []);

  const isBranchNameValid = React.useMemo(() => !/\s/.test(formFields.branch), [formFields]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  }, [formFields]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { branch } = formFields;

    setHasErrored(false);

    if (
      isGitProvider(localApiState)
      && isGitProvider(apiData)
    ) {
      // type casting because of "name" error - ignoring because not important
      const response = await addNewBranch(localApiState as StorageTypeCredentials, branch, startBranch ?? undefined);
      const branches = await fetchBranches(localApiState as StorageTypeCredentials);
      if (response) {
        onSuccess(branch, branches ?? []);
        if (!isCurrentChanges) {
          await pullTokens({
            context: { ...apiData, branch }, usedTokenSet, activeTheme,
          });
        }
      } else {
        setHasErrored(true);
      }

      if (isCurrentChanges) {
        await pushTokens({ ...apiData, branch });
      }
    }
  }, [
    formFields,
    localApiState,
    apiData,
    addNewBranch,
    isCurrentChanges,
    fetchBranches,
    pushTokens,
    onSuccess,
    startBranch,
  ]);

  const handleModalClose = React.useCallback(() => onClose(false), [onClose]);

  return (
    <Modal large isOpen={isOpen} close={handleModalClose}>
      <form onSubmit={handleSubmit}>
        <Stack direction="column" gap={4}>
          <Heading>
            Create a new branch from
            {' '}
            {isCurrentChanges
              ? 'current changes'
              : (
                <>
                  <GitBranchIcon size={12} />
                  {` ${startBranch}`}
                </>
              )}
          </Heading>
          <Input
            required
            full
            autofocus
            type="text"
            label="Branch name"
            value={formFields.branch}
            placeholder="branch"
            onChange={handleChange}
            name="branch"
            inputRef={branchInputRef}
          />
          {
            !isBranchNameValid && (
              <ErrorMessage data-cy="provider-modal-error">
                Branch name cannot contain spaces
              </ErrorMessage>
            )
          }
          <Stack direction="row" gap={4}>
            <Button variant="secondary" size="large" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!('branch' in formFields && isBranchNameValid)}>
              Save
            </Button>
          </Stack>
          {hasErrored && (
            <ErrorMessage data-cy="provider-modal-error">
              There was an error connecting. Check your credentials.
            </ErrorMessage>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
