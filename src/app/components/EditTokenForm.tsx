import * as React from 'react';
import Input from './Input';

const EditTokenForm = ({
    submitTokenValue,
    explainer = '',
    property,
    setShowEditForm,
    isPristine,
    initialToken,
    initialName,
    path,
}) => {
    const defaultValue = {
        token: initialToken,
        name: initialName,
        path,
    };
    const [tokenValue, setTokenValue] = React.useState(defaultValue);

    const handleChange = (e) => {
        e.persist();
        setTokenValue((prevState) => ({...prevState, [e.target.name]: e.target.value}));
    };

    const handleObjectChange = (e) => {
        e.persist();
        setTokenValue((prevState) => ({...prevState, token: {...prevState.token, [e.target.name]: e.target.value}}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitTokenValue(tokenValue);
        setShowEditForm(false);
    };

    const handleReset = () => {
        setShowEditForm(false);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-2 border-gray-200 rounded">
            <Input required full label="Name" value={tokenValue.name} onChange={handleChange} type="text" name="name" />
            <div>
                {typeof tokenValue.token === 'object' ? (
                    Object.entries(tokenValue.token).map(([key, value]) => (
                        <Input
                            key={key}
                            full
                            label={key}
                            value={value}
                            onChange={handleObjectChange}
                            type="text"
                            name={key}
                            required
                        />
                    ))
                ) : (
                    <Input
                        full
                        label={property}
                        value={tokenValue.token}
                        onChange={handleChange}
                        type="text"
                        name="token"
                        required
                    />
                )}

                {explainer && <div className="mt-1 text-xxs text-gray-600">{explainer}</div>}
            </div>
            <div className="flex space-x-2 justify-end">
                <button className="button button-link" type="button" onClick={handleReset}>
                    Cancel
                </button>
                <button className="button button-primary" type="submit">
                    {isPristine ? 'Create' : 'Update'}
                </button>
            </div>
        </form>
    );
};

export default EditTokenForm;
