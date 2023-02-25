import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query getAccounts {
    categories {
      id
      name
      color
    }
  }
`;
