import gql from 'graphql-tag';

export const GET_TRANSACTION_BY_ID = gql`
  query getTransactionById($id: String!) {
    transaction(id: $id) {
      id
      reference
      amount
      currency
      date
      account {
        name
      }
      category {
        id
        name
      }
    }
  }
`;
