<script>
import { ref } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { provideApolloClient } from '@vue/apollo-composable';
import { apolloClient } from './gql/apolloClient';

provideApolloClient(apolloClient);

export default {
  setup() {
    const variables = ref({
      skip: 0,
      take: 30,
    });

    const { result, loading, error } = useQuery(
      gql`
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
      `,
      variables
    );

    const transactions = computed(() => result.value?.transactions ?? []);
 
    const searchText = ref(''); 

    const filteredTransactions = computed(() => {
      if (searchText.value.trim().length === 0) {
        return transactions.value;
      } else {
        return transactions.value.filter((tr) =>
          tr.reference?.toLowerCase().includes(searchText.value.toLowerCase())
        );
      }
    });

    const searchRef = () => {
      // Do nothing, the computed property will automatically update
    };

    return {
      filteredTransactions,
      loading,
      error,
      searchText,
      searchRef,
    };
  },
};
</script>

<template>
  <div class="p-20 overflow-hidden">
    <div class="border">
      <div class="p-12">
        <div class="font-semibold text-lg">Transactions</div>
        <!-- TODO: filters -->
        <div class="flex flex-wrap gap-4 mt-6">
          <div>
            <div class="opacity-50 w-fit">Reference</div>
            <input v-model="searchText" class="w-72 h-8 border" @input="searchRef" />
            <!-- <input v-model="searchText" class="w-72 h-8 border" @input="(event)=> searchRef(event.target.value)" /> -->
          </div>
          <div>
            <div class="opacity-50">Bank</div>
            <input class="w-40 h-8 border" />
          </div>
          <div>
            <div class="opacity-50">Account</div>
            <input class="w-40 h-8 border" />
          </div>
          <div>
            <div class="opacity-50">Starting month</div>
            <input class="w-40 h-8 border" />
          </div>
          <div>
            <div class="opacity-50">Ending month</div>
            <input class="w-40 h-8 border" />
          </div>
        </div>

        <div v-if="loading">Loading...</div>

        <div v-else-if="error">Error: {{ error.message }}</div>

        <!-- TODO: Each transaction opens a details page -->
        <table v-if="filteredTransactions" class="w-full mt-8">
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
              v-for="value in filteredTransactions"
              :key="value.id"
              class="border-t pb-12 h-12"
            >
              <td :style="{ opacity: value.reference ? '' : '0.2' }">
                {{ value.reference ?? 'No reference provided' }}
              </td>
              <td>
                <div
                  class="w-fit px-2 rounded-sm"
                  :style="{ backgroundColor: '#' + value.category?.color }"
                >
                  {{ value.category.name }}
                </div>
              </td>
              <td>{{ value.date.slice(0, 10).replaceAll('-', '/') }}</td>
              <td class="text-end">
                <span class="opacity-50">{{ value.currency }}</span>
                {{ value.amount }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
