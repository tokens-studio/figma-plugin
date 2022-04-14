import React from 'react';
import { useSelector } from 'react-redux';
import { GitBranchIcon } from '@primer/octicons-react';
import Modal from '../Modal';
import Heading from '../Heading';
import Button from '../Button';
import Input from '../Input';
import useRemoteTokens from '../../store/remoteTokens';
import { localApiStateSelector } from '@/selectors';
import Stack from '../Stack';

type Props = {
  isOpen: boolean
  startBranch: string
  onClose: (arg: boolean) => void
  onSuccess: () => void
};

// @TODO use hooks

export default function CreateBranchModal({
  isOpen, onClose, onSuccess, startBranch, isCurrentChanges,
}: Props) {
  const { addNewBranch } = useRemoteTokens();

  const localApiState = useSelector(localApiStateSelector);

  const [formFields, setFormFields] = React.useState({});
  const [hasErrored, setHasErrored] = React.useState(false);

  const handleCreateNewClick = async () => {
    setHasErrored(false);
    let response;

    if (isCurrentChanges) {
      response = await addNewBranch({
        provider: localApiState.provider,
        startBranch: localApiState.branch,
        ...formFields,
      });
    } else {
      response = await addNewBranch({
        provider: localApiState.provider,
        startBranch,
        ...formFields,
      });
    }

    if (response) {
      onSuccess();
    } else {
      setHasErrored(true);
    }
  };

  const handleChange = (e: any) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    handleCreateNewClick();
  };

  return (
    <Modal large isOpen={isOpen} close={() => onClose(false)}>
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
            full
            label="Branch name"
            value={formFields.branch}
            placeholder="branch"
            onChange={handleChange}
            type="text"
            name="branch"
            required
          />
          <Stack direction="row" gap={4}>
            <Button variant="secondary" size="large" onClick={() => onClose(false)}>
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
