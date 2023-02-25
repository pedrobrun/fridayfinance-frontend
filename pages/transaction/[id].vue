<script setup>
import { GET_TRANSACTION_BY_ID } from '@/gql/transactions/getTransactionById';
import { UPDATE_TRANSACTION } from '@/gql/transactions/updateTransaction';
import { GET_CATEGORIES } from '@/gql/categories/getCategories';
import { useMutation, useQuery } from '@vue/apollo-composable';
import { useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const route = useRoute();
const router = useRouter();

const { result, loading, error, refetch } = useQuery(GET_TRANSACTION_BY_ID, {
  id: route.params.id,
});

const {
  result: categoriesResult,
  loading: categoriesLoading,
  error: categoriesError,
} = useQuery(GET_CATEGORIES);

const categoryRef = ref({});

const transaction = computed(() => {
  if (result.value) {
    categoryRef.value = result.value.transaction.category;
  }
  return result.value?.transaction ?? {};
});
const categories = computed(() => categoriesResult.value?.categories ?? []);

async function updateTransactionCategory(transactionId, categoryId) {
  const { mutate } = useMutation(UPDATE_TRANSACTION, {
    variables: {
      id: transactionId,
      categoryId: categoryId,
    },
  });

  mutate();
  await toast.promise(mutate(), {
    pending: 'Loading...',
    success: 'Successfuly updated!',
    error: 'Something went wrong...',
  });
  refetch();
}
</script>

<template>
  <div class="m-12">
    <button
      class="text-4xl transition duration-150 ease-in-out hover:scale-125 mb-5"
      @click="router.back()"
    >
      🔙
    </button>
    <div v-if="loading">Loading</div>
    <div v-if="error">Error</div>
    <div v-if="transaction">
      <div class="font-bold">Transaction</div>
      <div
        :class="
          transaction?.amount >= 0
            ? 'bg-gradient-to-r from-green-100'
            : 'bg-gradient-to-r from-red-100'
        "
        class="p-5 mt-4"
      >
        <div>
          <span class="opacity-50">Reference: </span
          >{{ transaction?.reference ?? 'No reference provided' }}
        </div>
        <div>
          <span class="opacity-50">Amount: </span>{{ transaction?.amount }}
          {{ transaction?.currency }}
        </div>
        <div class="flex space-x-3 items-center">
          <div class="opacity-50 h-7">Category:</div>
          <select
            v-model="categoryRef"
            class="border h-6 border-black border-opacity-50 rounded-sm px-2 py"
          >
            <option :value="transaction?.category">
              {{ transaction?.category?.name }}
            </option>
            <option :value="category" v-for="category in categories">
              {{ category.name }}
            </option>
          </select>
          <div v-if="transaction?.category?.id !== categoryRef?.id">
            <button
              class="px-1 h-6 text-sm rounded-sm bg-yellow-100 border-black border transition duration-150 ease-in-out hover:scale-110"
              @click="updateTransactionCategory(transaction.id, categoryRef.id)"
            >
              Update Category
            </button>
          </div>
        </div>
        <div>
          <span class="opacity-50">Account:</span>
          {{ transaction?.account?.name }}
        </div>
        <div>
          <span class="opacity-50">Date: </span
          >{{ transaction?.date?.slice(0, 10).replaceAll('-', '/') }}
        </div>
      </div>
    </div>
  </div>
</template>
