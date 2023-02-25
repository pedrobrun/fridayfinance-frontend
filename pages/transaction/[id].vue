<script setup>
import { GET_TRANSACTION_BY_ID } from '@/gql/queries/transactions/getTransactionById'
import { GET_CATEGORIES } from '@/gql/queries/categories/getCategories'
import { useQuery } from '@vue/apollo-composable';
import { useRoute } from 'vue-router';

const route = useRoute()
const router = useRouter()

console.log('ROUTE PARAMS, route.params.id', route.params.id)

const { result, loading, error } = useQuery(
  GET_TRANSACTION_BY_ID,
  { id: route.params.id }
);

const { result: categoriesResult, loading: categoriesLoading, error: categoriesError } = useQuery(
  GET_CATEGORIES,
);

const currentCategory = ref({});

const transaction = computed(() => {
  if (result.value) {
    currentCategory.value = result.value.transaction.category;
  }
  return result.value?.transaction ?? {}
});
const categories = computed(() => categoriesResult.value?.categories ?? []);

console.log('currentCategory', currentCategory)

</script>

<template>
  <div class="m-12">
    <button class="text-4xl transition duration-150 ease-in-out hover:scale-125 mb-5" @click="router.back()">🔙</button>
    <div v-if="loading">Loading</div>
    <div v-if="error">Error</div>
    <div v-if="transaction">
      <div class="font-bold">Transaction</div>
      <div :class="transaction?.amount >= 0 ? 'bg-gradient-to-r from-green-100' : 'bg-gradient-to-r from-red-100'" class="p-5 mt-4">
        <div><span class="opacity-50">Reference: </span>{{ transaction?.reference ?? 'No reference provided' }}</div>
        <div><span class="opacity-50">Amount: </span>{{ transaction?.amount }} {{ transaction?.currency }}</div>
        <div class="flex space-x-3 items-center">
          <div class="opacity-50 h-7">Category:</div>
          <select v-model="currentCategory" class="border h-6 border-black border-opacity-50 rounded-sm px-2 py">
            <option :value="transaction?.category">{{ transaction?.category?.name }}</option>
            <option :value="category" v-for="category in categories">{{ category.name }}</option>
          </select>
          <div v-if="transaction?.category?.id !== currentCategory?.id">
            <button class="px-1 h-6 text-sm rounded-sm bg-yellow-100 border-black border transition duration-150 ease-in-out hover:scale-110">Update Category</button>
          </div>
        </div>
        <div><span class="opacity-50">Account:</span> {{ transaction?.account?.name }}</div>
        <div><span class="opacity-50">Date: </span>{{ transaction?.date?.slice(0,10).replaceAll('-', '/') }}</div>
      </div>
    </div>
  </div>
</template>