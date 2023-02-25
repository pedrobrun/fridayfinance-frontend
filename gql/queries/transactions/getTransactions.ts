import gql from 'graphql-tag';

export const GET_TRANSACTIONS = gql`
  query getTransactions($skip: Int!, $take: Int!) {
    transactions(pagination: { skip: $skip, take: $take }) {
      id
      accountId
      reference
      amount
      currency
      date
      category {
        name
        color
      }
    }
  }
`;
