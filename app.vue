<script>
import { ref } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { provideApolloClient } from '@vue/apollo-composable';
import { apolloClient } from './gql/apolloClient';

provideApolloClient(apolloClient);

export default {
  setup() {
    const skip = ref(0);
    const take = ref(30);

    const { result, loading, error, fetchMore } = useQuery(
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
      { skip, take },
      { fetchPolicy: 'cache-and-network' }
    );

    function loadMore () {
      fetchMore({
        variables: {
          skip: result.value.transactions.length,
          take: 30,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult

          return {
            ...previousResult,
            transactions: [
              ...previousResult.transactions,
              ...fetchMoreResult.transactions,
            ],
          }
        },
      })
    }

    const {
      result: accResult,
    } = useQuery(
      gql`
        query getAccounts {
          accounts {
            id
            name
          }
        }
      `
    );

    const transactions = computed(() => result.value?.transactions ?? []);
    const accounts = computed(() => accResult.value?.accounts ?? []);

    const searchText = ref('');

    const searchAcc = ref({ name: 'All' });

    const filteredTransactions = computed(() => {
      if (searchAcc.value.name !== 'All') {
        const accId = searchAcc.value.id;
        const filtered = transactions.value.filter(
          (tr) => tr.accountId === accId
        );

        if (searchText.value.trim().length >= 0) {
          return filtered.filter((tr) =>
            tr.reference?.toLowerCase().includes(searchText.value.toLowerCase())
          );
        }

        return (transactions.value = filtered);
      }

      if (searchAcc.value.name === 'All') {
        if (searchText.value.trim().length === 0) {
          return transactions.value;
        }

        return transactions.value.filter((tr) =>
        tr.reference?.toLowerCase().includes(searchText.value.toLowerCase())
      );
      }

      if (searchText.value.trim().length === 0) {
        return transactions.value;
      }

      return transactions.value.filter((tr) =>
        tr.reference?.toLowerCase().includes(searchText.value.toLowerCase())
      );
    });

    const searchRef = () => {
      // Do nothing, the computed property will automatically update
    };

    return {
      filteredTransactions,
      accounts,
      loading,
      error,
      searchText,
      searchAcc,
      searchRef,
      loadMore,
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
            <input
              v-model="searchText"
              class="w-72 h-8 border"
              @input="searchRef"
            />
          </div>
          <div>
            <div class="opacity-50">Account</div>

            <select v-model="searchAcc" class="w-40 h-8 border">
              <option :value="{ name: 'All' }">All</option>
              <option :value="acc" v-for="acc in accounts">
                {{ acc.name }}
              </option>
            </select>
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

        <div v-if="filteredTransactions.length === 0">
          <div class="mt-12 text-xl">No transactions found...</div>
        </div>

        <!-- TODO: Each transaction opens a details page -->
        <table v-else="filteredTransactions" class="w-full mt-8">
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
                  {{ value.category?.name }}
                </div>
              </td>
              <td>{{ value.date.slice(0, 10).replaceAll('-', '/') }}</td>
              <td class="text-end">
                <span class="opacity-50">{{ value.currency }}</span>
                {{ value.amount }}
              </td>
            </tr>
          </tbody>

          <div class="mt-20">

            <button class="text-white rounded-sm bg-blue-400 text-2xl border px-10 py-2" @click="loadMore()">Load More</button>
          </div>
        </table>
      </div>
    </div>
  </div>
</template>
