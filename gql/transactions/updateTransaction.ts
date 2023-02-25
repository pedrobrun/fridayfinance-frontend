import gql from 'graphql-tag';

export const UPDATE_TRANSACTION = gql`
  mutation updateTransaction(
    $id: String!
    $accountId: String
    $categoryId: String
    $reference: String
    $amount: Float
    $currency: String
    $date: DateTime
  ) {
    updateTransaction(
      id: $id
      updateTransactionInput: {
        accountId: $accountId
        categoryId: $categoryId
        reference: $reference
        amount: $amount
        currency: $currency
        date: $date
      }
    ) {
      id
    }
  }
`;
