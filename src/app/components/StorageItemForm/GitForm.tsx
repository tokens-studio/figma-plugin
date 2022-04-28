import React, { useRef } from 'react';
import Box from '../Box';
import Button from '../Button';
import Input from '../Input';
import Stack from '../Stack';

export default function GitForm({
  handleChange, handleSubmit, handleCancel, values, hasErrored,
}) {
  const inputEl = useRef(null);
  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Input full label="Name" value={values.name} onChange={handleChange} type="text" name="name" required />
        <Box css={{ position: 'relative' }}>
          <Input
            full
            label="Personal Access Token"
            value={values.secret}
            onChange={handleChange}
            inputRef={inputEl}
            isMasked
            type="password"
            name="secret"
            required
          />
        </Box>
        <Input
          full
          label="Repository (username/repo)"
          value={values.id}
          onChange={handleChange}
          type="text"
          name="id"
          required
        />
        <Input
          full
          label="Default Branch"
          value={values.branch}
          onChange={handleChange}
          type="text"
          name="branch"
          required
        />
        <Input
          full
          label="File Path (e.g. data/tokens.json)"
          value={values.filePath}
          onChange={handleChange}
          type="text"
          name="filePath"
          required
        />
        <Input
          full
          label="baseUrl (optional)"
          value={values.baseUrl}
          placeholder="https://github.acme-inc.com/api/v3"
          onChange={handleChange}
          type="text"
          name="baseUrl"
        />
        <Stack direction="row" gap={4}>
          <Button variant="secondary" size="large" onClick={handleCancel}>
            Cancel
          </Button>

          <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
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
  );
}
