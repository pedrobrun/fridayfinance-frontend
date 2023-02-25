<script setup>
import { ref } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { provideApolloClient } from '@vue/apollo-composable';
import { apolloClient } from '../gql/apolloClient';
import { GET_TRANSACTIONS } from '../gql/queries/transactions/getTransactions';
import { GET_ACCOUNTS } from '../gql/queries/accounts/getAccounts';

const skip = ref(0);
const take = ref(30);

const { result, loading, error, fetchMore } = useQuery(GET_TRANSACTIONS, {
  skip,
  take,
});

function loadMore() {
  fetchMore({
    variables: {
      skip: result.value.transactions.length,
      take: 30,
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) return previousResult;

      return {
        ...previousResult,
        transactions: [
          ...previousResult.transactions,
          ...fetchMoreResult.transactions,
        ],
      };
    },
  });
}

const { result: accResult } = useQuery(GET_ACCOUNTS);

const transactions = computed(() => result.value?.transactions ?? []);
const accounts = computed(() => accResult.value?.accounts ?? []);

const searchText = ref('');
const searchAcc = ref({ name: 'All' });
const startDate = ref('');
const endDate = ref('');

const filteredTransactions = computed(() => {
  let filtered = transactions.value;

  if (searchAcc.value.name !== 'All') {
    const accId = searchAcc.value.id;
    filtered = filtered.filter((tr) => tr.accountId === accId);
  }

  if (searchText.value.trim().length >= 1) {
    filtered = filtered.filter((tr) =>
      tr.reference?.toLowerCase().includes(searchText.value.toLowerCase())
    );
  }

  if (startDate.value) {
    filtered = filtered.filter((tr) => {
      const trDate = new Date(tr.date);
      return trDate >= new Date(startDate.value);
    });
  }

  if (endDate.value) {
    filtered = filtered.filter((tr) => {
      const trDate = new Date(tr.date);
      return trDate <= new Date(endDate.value);
    });
  }

  return filtered;
});

async function navigateToTransactionDetails(transactionId) {
  await navigateTo({ path: `/transaction/${transactionId}` });
}
</script>

<template>
  <div class="p-12">
    <div class="font-semibold text-lg">
      Transactions <span v-if="loading">⏳</span> <span v-else-if="filteredTransactions.length > 0">✅</span> <span v-else>🤷</span>
    </div>
    <!-- TODO: filters -->
    <div class="flex gap-4 justify-between mt-6">
      <div class="w-1/3">
        <div class="opacity-50">Reference</div>
        <input
          v-model="searchText"
          class="px-2 w-full h-8 border"
          @input="searchRef"
        />
      </div>
      <div class="flex space-x-5 items-center">
        <div>
          <div class="opacity-50 w-2/3">Account</div>
          <select v-model="searchAcc" class="px-2 w-40 h-8 border">
            <option :value="{ name: 'All' }">All</option>
            <option :value="acc" v-for="acc in accounts">
              {{ acc.name }}
            </option>
          </select>
        </div>
        <div>
          <div class="opacity-50">Starting date</div>
          <input
            v-model="startDate"
            class="w-40 px-2 h-8 border"
            type="date"
            name="dateofbirth"
            id="dateofbirth"
          />
        </div>

        <div>
          <div class="opacity-50">Ending date</div>
          <input
            v-model="endDate"
            class="w-40 px-2 h-8 border"
            type="date"
            name="dateofbirth"
            id="dateofbirth"
          />
        </div>
      </div>
    </div>

    <div v-if="error">Error: {{ error.message }}</div>

    <div v-if="filteredTransactions.length === 0">
      <div class="flex items-baseline mt-5 text-lg">
        No transactions found...
      </div>

      <button
        class="text-white rounded-sm bg-blue-400 text-xl border px-10 py-2 transition duration-150 ease-in-out hover:scale-110 mt-5"
        @click="loadMore()"
      >
        {{ loading ? 'Loading' : 'Load more' }}
      </button>
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
          @click="navigateToTransactionDetails(value.id)"
          class="transition duration-50 ease-in-out hover:scale-[1.05] border-t pb-12 h-12 cursor-pointer"
          :class="
            value.amount > 0
              ? 'hover:from-green-100 hover:bg-gradient-to-r'
              : 'hover:from-red-100 hover:bg-gradient-to-r'
          "
        >
          <td :class="value.reference ? '' : 'opacity-50'">
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
            {{ value.amount }}
            <span class="opacity-50">{{ value.currency }}</span>
          </td>
        </tr>
      </tbody>

      <div class="mt-20">
        <button
          class="text-white rounded-sm bg-blue-400 text-xl border px-10 py-2 transition duration-150 ease-in-out hover:scale-110"
          @click="loadMore()"
        >
          {{ loading ? 'Loading...' : 'Load more' }}
        </button>
      </div>
    </table>
  </div>
</template>
