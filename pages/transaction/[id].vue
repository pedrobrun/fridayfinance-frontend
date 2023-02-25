<script setup>
import { GET_TRANSACTION_BY_ID } from '@/gql/queries/transactions/getTransactionById'
import { useQuery } from '@vue/apollo-composable';
import { useRoute } from 'vue-router';

const route = useRoute()
const router = useRouter()

console.log('ROUTE PARAMS, route.params.id', route.params.id)

const { result, loading, error } = useQuery(
  GET_TRANSACTION_BY_ID,
  { id: route.params.id }
);

const transaction = computed(() => result.value?.transaction ?? {});
console.log('transaction', transaction)

</script>

<template>
  <div class="m-12">
    <button class="text-4xl transition delay-75 duration-150 ease-in-out hover:scale-125 mb-5" @click="router.back()">🔙</button>
    <div v-if="loading">Loading</div>
    <div v-if="error">Error</div>
    <div v-else>
      <div><span class="opacity-50">Reference: </span>{{ transaction?.reference ?? 'No reference provided' }}</div>
      <div><span class="opacity-50">Amount: </span>{{ transaction?.amount }} {{ transaction.currency }}</div>
      <div><span class="opacity-50">Category:</span> {{ transaction?.category?.name }}</div>
      <div><span class="opacity-50">Account:</span> {{ transaction?.account?.name }}</div>
      <div><span class="opacity-50">Date: </span>{{ transaction?.date?.slice(0,10).replaceAll('-', '/') }}</div>
    </div>
  </div>
</template>