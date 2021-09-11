export const aliasRegex = /(\$[^\s,]+\w)|({[^\s]+})/g;

export const findReferences = (tokenValue: string) => {
    return tokenValue?.toString().match(aliasRegex);
};

export const findMatchingReferences = (tokenValue: string, valueToLookFor: string) => {
    const references = findReferences(tokenValue);

    if (references) {
        return references.filter((ref) => {
            const name = ref.startsWith('{') ? ref.slice(1, ref.length - 1) : ref.substring(1);
            if (name === valueToLookFor) return ref;
        });
    }
    return [];
};

export const replaceReferences = (tokenValue: string, oldName: string, newName: string) => {
    if (tokenValue.includes(oldName)) {
        const references = findMatchingReferences(tokenValue, oldName);
        let newValue = tokenValue;
        references.forEach((reference) => {
            newValue = newValue.replace(reference, `{${newName}}`);
        });
        return newValue;
    }
    return tokenValue;
};
