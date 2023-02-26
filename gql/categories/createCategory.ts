import gql from 'graphql-tag';

export const CREATE_CATEGORY = gql`
  mutation createCategory($name: String!, $color: String!) {
    createCategory(createCategoryInput: { name: $name, color: $color }) {
      id
      name
    }
  }
`;
