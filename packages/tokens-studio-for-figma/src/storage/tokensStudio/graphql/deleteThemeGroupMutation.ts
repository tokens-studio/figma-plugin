export const DELETE_THEME_GROUP_MUTATION = `
mutation DeleteThemeGroup($urn: String!) {
    deleteThemeGroup(urn: $urn) {
        urn
        name
        options {
            name
            urn
            figmaStyleReferences
            figmaVariableReferences
            selectedTokenSets
        }
    }
}
`;
