import * as React from 'react';

const TabButton = ({name, label, active, setActive}) => (
    <button
        type="button"
        className={`w-14 p-2 text-xxs focus:outline-none focus:shadow-none cursor-pointer hover:bg-gray-200 ${
            active === name ? 'text-black font-bold' : 'text-gray-600'
        }`}
        name="text"
        onClick={() => setActive(name)}
    >
        {label}
    </button>
);

const Navbar = ({active, setActive}) => {
    return (
        <div className="sticky top-0 navbar bg-white -mx-2 flex justify-content-between z-1">
            <TabButton name="tokens" label="Tokens" active={active} setActive={setActive} />
            <TabButton name="json" label="JSON" active={active} setActive={setActive} />
            <TabButton name="inspector" label="Inspector" active={active} setActive={setActive} />
        </div>
    );
};

export default Navbar;
