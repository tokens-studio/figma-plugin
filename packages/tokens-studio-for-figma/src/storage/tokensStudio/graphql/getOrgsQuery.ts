import { gql } from '@tokens-studio/sdk';

export const GET_ORGS_QUERY = gql`
  query Organizations {
    organizations {
      data {
        name
        id
        projects {
          data {
            name
            id
          }
        }
      }
    }
  }
`;
