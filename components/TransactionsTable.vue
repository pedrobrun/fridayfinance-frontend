<script setup>
import { ref } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { GET_TRANSACTIONS } from '../gql/transactions/getTransactions';
import { GET_ACCOUNTS } from '../gql/accounts/getAccounts';
import { GET_CATEGORIES } from '~~/gql/categories/getCategories';

const { result, loading, error, fetchMore } = useQuery(
  GET_TRANSACTIONS,
  { take: 100 },
  { fetchPolicy: 'cache-and-network' }
);

function loadMore() {
  fetchMore({
    variables: {
      after: transactions.value[transactions.value.length - 1].id,
      take: 100,
      /**
       * TODO: find out how to filter after paginate,
       * instead of paginating before filtering
       */
      // reference: searchRef,
      // accountId: searchAcc?.value?.id,
      // categoryId: searchCategory?.value?.id,
      // startDate: startDate,
      // endDate: endDate,
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) return previousResult;
      return {
        ...previousResult,
        transactions: {
          edges: [
            ...previousResult.transactions.edges,
            ...fetchMoreResult.transactions.edges,
          ],
        },
      };
    },
  });
}

const { result: accResult } = useQuery(GET_ACCOUNTS);
const { result: categoriesResult } = useQuery(GET_CATEGORIES, null, {
  fetchPolicy: 'cache-and-network',
});

const transactions = computed(() => result.value?.transactions?.edges ?? []);
const accounts = computed(() => accResult.value?.accounts ?? []);
const categories = computed(() => categoriesResult.value?.categories ?? []);

const searchRef = ref('');
const searchAcc = ref({ name: 'All' });
const searchCategory = ref({ name: 'All' });
const startDate = ref(null);
const endDate = ref(null);

const filteredTransactions = computed(() => {
  let filtered = transactions.value;

  if (searchAcc.value.name !== 'All' && searchAcc.value.id) {
    const accId = searchAcc.value.id;
    filtered = filtered.filter((tr) => tr.account.id === accId);
  }

  if (searchCategory.value.name !== 'All' && searchCategory.value.id) {
    const categoryId = searchCategory.value.id;
    filtered = filtered.filter((tr) => tr.category?.id === categoryId);
  }

  if (searchRef.value.trim().length >= 1) {
    filtered = filtered.filter((tr) =>
      tr.reference?.toLowerCase().includes(searchRef.value.toLowerCase())
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
      Transactions <span v-if="loading">⏳</span>
      <span v-else-if="transactions.length > 0">✅</span>
      <span v-else>🤷</span>
    </div>
    <div class="opacity-50" v-if="transactions.length > 0">
      Currently {{ transactions.length }} transactions to filter on
    </div>
    <div class="flex gap-4 bg-gray-100 justify-between mt-6">
      <div class="w-1/3">
        <div class="opacity-50">Reference</div>
        <input
          v-model="searchRef"
          class="px-2 w-full h-8 border"
          @input="searchRef"
        />
      </div>
      <div class="flex space-x-5 py-2 items-center">
        <div>
          <div class="opacity-50 w-2/3">Category</div>
          <select v-model="searchCategory" class="px-2 w-40 h-8 border">
            <option :value="{ name: 'All' }">All</option>
            <option :value="ctg" v-for="ctg in categories">
              {{ ctg.name }}
            </option>
          </select>
        </div>
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
          <input v-model="startDate" class="w-40 px-2 h-8 border" type="date" />
        </div>

        <div>
          <div class="opacity-50">Ending date</div>
          <input v-model="endDate" class="w-40 px-2 h-8 border" type="date" />
        </div>
      </div>
    </div>

    <div v-if="error">Error: {{ error.message }}</div>

    <div v-if="filteredTransactions.length === 0">
      <div v-if="!loading" class="flex items-baseline mt-5 text-lg">
        No transactions found...
      </div>

    </div>

    <!-- TODO: Each transaction opens a details page -->
    <div class="max-h-[80vh] overflow-y-scroll overflow-x-hidden">

      <table  v-if="filteredTransactions.length > 0" class="w-full mt-8"  >
        <thead>
          <tr>
            <th class="text-start pl-4">Reference</th>
            <th class="text-start">Category</th>
            <th class="text-start">Account</th>
            <th class="text-start">Date</th>
            <th class="text-end pr-4">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="value in filteredTransactions"
            :key="value.id"
            @click="navigateToTransactionDetails(value.id)"
            class="transition duration-50 ease-in-out hover:scale-[1.01] border-t pb-12 h-12 cursor-pointer"
            :class="
              value.amount > 0
                ? 'hover:from-green-100 hover:bg-gradient-to-r'
                : 'hover:from-red-100 hover:bg-gradient-to-r'
            "
          >
            <td class="pl-4" :class="value.reference ? '' : 'opacity-50'">
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
            <td>{{ value.account?.name }}</td>
            <td>{{ value.date.slice(0, 10).replaceAll('-', '/') }}</td>
            <td class="text-end pr-4 flex flex-col">
              <div>
                {{ value.amount }}
              </div>
              <span class="opacity-50 text-xs">{{ value.currency }}</span>
            </td>
          </tr>
        </tbody>
  
      </table>
    </div>
      <button
        class="text-white mt-10 rounded-sm bg-blue-400 text-xl border px-10 py-2 transition duration-150 ease-in-out hover:scale-110"
        @click="loadMore()"
      >
        {{ loading ? 'Loading...' : 'Load more' }}
      </button>
  </div>
</template>
