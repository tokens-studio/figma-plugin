interface GetADOCreatePullRequestUrl {
  (args: {
    branch?: string
    orgUrl?: string
    projectId?: string
    repositoryId?: string
  }): string
}

export const getADOCreatePullRequestUrl: GetADOCreatePullRequestUrl = ({
  branch,
  orgUrl,
  projectId,
  repositoryId,
}) => `${orgUrl}${projectId && `/${projectId}`}/_git/${repositoryId}/pullrequestcreate?sourceRef=${branch}&targetRef=main`;
