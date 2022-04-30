import React from 'react';
import { useSelector } from 'react-redux';
import { GitBranchIcon } from '@primer/octicons-react';
import Modal from '../Modal';
import Heading from '../Heading';
import Button from '../Button';
import Input from '../Input';
import useRemoteTokens from '../../store/remoteTokens';
import { apiSelector, localApiStateSelector } from '@/selectors';
import Stack from '../Stack';
import { ApiDataType } from '@/types/api';

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

// @TODO use hooks

export default function CreateBranchModal({
  isOpen, onClose, onSuccess, startBranch, isCurrentChanges,
}: Props) {
  const { addNewBranch, pushTokens, fetchBranches } = useRemoteTokens();

  const localApiState: ApiDataType = useSelector(localApiStateSelector);
  const apiData: ApiDataType = useSelector(apiSelector);

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

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  }, [formFields]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { branch } = formFields;

    setHasErrored(false);

    const response = await addNewBranch(localApiState, branch, startBranch);
    const branches = await fetchBranches(localApiState);

    if (response) {
      onSuccess(branch, branches ?? []);
    } else {
      setHasErrored(true);
    }

    if (isCurrentChanges) await pushTokens({ ...apiData, branch });
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
          <Stack direction="row" gap={4}>
            <Button variant="secondary" size="large" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!formFields.branch}>
              Save
            </Button>
          </Stack>
          {hasErrored && (
            <div className="bg-red-200 text-red-700 rounded p-4 text-xs font-bold" data-cy="provider-modal-error">
              There was an error connecting. Check your credentials.
            </div>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
