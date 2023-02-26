import gql from 'graphql-tag';

export const GET_TRANSACTIONS = gql`
  query getTransactions(
    $skip: Int!
    $take: Int!
    $categoryId: String
    $accountId: String
    $startDate: DateTime
    $endDate: DateTime
  ) {
    transactions(
      pagination: { skip: $skip, take: $take }
      filter: {
        categoryId: $categoryId
        accountId: $accountId
        startDate: $startDate
        endDate: $endDate
      }
    ) {
      id
      account {
        id
        name
      }
      reference
      amount
      currency
      date
      category {
        id
        name
        color
      }
    }
  }
`;
