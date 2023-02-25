import gql from 'graphql-tag';

export const GET_ACCOUNTS = gql`
  query getAccounts {
    accounts {
      id
      name
    }
  }
`;
