import gql from 'graphql-tag';

export const GET_TRANSACTIONS = gql`
  query getTransactions(
    $after: String
    $take: Int!
    $categoryId: String
    $accountId: String
    $startDate: DateTime
    $endDate: DateTime
  ) {
    transactions(
      pagination: { after: $after, take: $take }
      filter: {
        categoryId: $categoryId
        accountId: $accountId
        startDate: $startDate
        endDate: $endDate
      }
    ) {
      edges {
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
  }
`;
