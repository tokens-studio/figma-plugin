import React from 'react';
import Button from '../Button';
import Input from '../Input';

export default function GitHubForm({handleChange, handleSubmit, handleCancel, values, hasErrored}) {
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input full label="Name" value={values.name} onChange={handleChange} type="text" name="name" required />
            <Input
                full
                label="Personal Access Token"
                value={values.secret}
                onChange={handleChange}
                type="text"
                name="secret"
                required
            />
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
            <div className="space-x-4">
                <Button variant="secondary" size="large" onClick={handleCancel}>
                    Cancel
                </Button>

                <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
                    Save
                </Button>
            </div>
            {hasErrored && (
                <div className="bg-red-200 text-red-700 rounded p-4 text-xs font-bold" data-cy="provider-modal-error">
                    There was an error connecting. Check your credentials.
                </div>
            )}
        </form>
    );
}
