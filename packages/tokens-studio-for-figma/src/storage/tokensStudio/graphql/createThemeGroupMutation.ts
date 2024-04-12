export const CREATE_THEME_GROUP_MUTATION = `
mutation CreateThemeGroup($project: String!, $input: ThemeGroupInput!) {
    createThemeGroup(project: $project, input: $input) {
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
}`;
