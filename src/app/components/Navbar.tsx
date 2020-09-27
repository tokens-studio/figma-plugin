import * as React from 'react';

const TabButton = ({name, label, active, setActive, first = false}) => (
    <button
        type="button"
        className={`px-2 py-4 text-xxs focus:outline-none focus:shadow-none font-medium cursor-pointer hover:text-black
        ${active === name ? 'text-black' : 'text-gray-500'}
        ${first ? 'pl-4' : ''}`}
        name="text"
        onClick={() => setActive(name)}
    >
        {label}
    </button>
);

const Navbar = ({active, setActive}) => {
    return (
        <div className="sticky top-0 navbar bg-white flex justify-content-between z-1 border-b border-gray-200">
            <TabButton first name="tokens" label="Tokens" active={active} setActive={setActive} />
            <TabButton name="json" label="JSON" active={active} setActive={setActive} />
            <TabButton name="inspector" label="Inspector" active={active} setActive={setActive} />
        </div>
    );
};

export default Navbar;
