<script>
import { createApp, provide, h } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { provideApolloClient } from '@vue/apollo-composable';
import { apolloClient } from './gql/apolloClient';
import { ref } from 'vue';

provideApolloClient(apolloClient);

// const app = createApp({
//   setup() {
//     provide(DefaultApolloClient, apolloClient);
//   },

//   render: () => h(App),
// });

const variables = ref({
  skip: 0,
  take: 50,
});

export default {
  setup() {
    const { result, loading, error } = useQuery(
      gql`
        query getTransactions($skip: Int!, $take: Int!) {
          transactions(pagination: { skip: $skip, take: $take }) {
            id
            accountId
            categoryId
            reference
            amount
            currency
            date
          }
        }
      `,
      variables
    );

    const transactions = computed(() => result.value?.transactions ?? []);

    return {
      transactions,
      loading,
      error,
    };
  },
};
</script>

<template>
  <div class="p-20 overflow-hidden">
    <div class="border">
      <div class="p-12">
        <div class="font-semibold text-lg">Transactions</div>
        <div class="flex flex-wrap gap-4 mt-6">
          <div>
            <div class="opacity-50 w-fit">Search</div>
            <div class="w-72 h-8 border"></div>
          </div>
          <div>
            <div class="opacity-50">Bank</div>
            <div class="w-40 h-8 border"></div>
          </div>
          <div>
            <div class="opacity-50">Account</div>
            <div class="w-40 h-8 border"></div>
          </div>
          <div>
            <div class="opacity-50">Starting month</div>
            <div class="w-40 h-8 border"></div>
          </div>
          <div>
            <div class="opacity-50">Ending month</div>
            <div class="w-40 h-8 border"></div>
          </div>
        </div>

        <div v-if="loading">Loading...</div>

        <div v-else-if="error">Error: {{ error.message }}</div>

        <table v-if="transactions" class="w-full mt-8">
          <thead>
            <tr>
              <th class="text-start">Reference</th>
              <th class="text-start">Category</th>
              <th class="text-start">Date</th>
              <th class="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="value in transactions"
              :key="value.id"
              class="border-t pb-12"
            >
              <td>{{ value.reference ?? 'No reference provided' }}</td>
              <td>{{ value.categoryId }}</td>
              <td>{{ value.date }}</td>
              <td class="text-end">{{ value.amount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
