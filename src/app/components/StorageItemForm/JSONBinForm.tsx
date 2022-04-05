import React from 'react';
import Button from '../Button';
import Input from '../Input';
import Stack from '../Stack';

export default function JSONBinForm({
  isNew = false, handleChange, handleSubmit, handleCancel, values, hasErrored,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Input full label="Name" value={values.name} onChange={handleChange} type="text" name="name" required />
        <Input
          full
          label="Secret"
          value={values.secret}
          onChange={handleChange}
          type="text"
          name="secret"
          required
        />
        <Input
          full
          label={`ID${isNew ? ' (optional)' : ''}`}
          value={values.id}
          onChange={handleChange}
          type="text"
          name="id"
          required={!isNew}
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
