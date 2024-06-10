export const UPDATE_THEME_GROUP_MUTATION = `
mutation UpdateThemeGroup($urn: String!, $input: ThemeGroupInput!) {
    updateThemeGroup(urn: $urn, input: $input) {
        urn
        name
        projectUrn
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
