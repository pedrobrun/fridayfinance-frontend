<script setup>
import { provideApolloClient } from '@vue/apollo-composable';
import { apolloClient } from '@/gql/apolloClient';
provideApolloClient(apolloClient);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
