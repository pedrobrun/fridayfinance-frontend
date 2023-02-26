<script setup>
import { toast } from 'vue3-toastify';
import { CREATE_CATEGORY } from '@/gql/categories/createCategory';
import { useMutation } from '@vue/apollo-composable';

const router = useRouter();
const name = ref();
const color = ref('#0000ff');

const { mutate } = useMutation(CREATE_CATEGORY);

async function submit() {
  if (!name.value) {
    return toast.error('✏️ Missing Name');
  }
  if (!color.value) {
    return toast.error('🎨 Missing Color');
  }
  if (color.value.length > 7) {
    return toast.error('🎨 Invalid hex code');
  }

  color.value = color.value.slice(1);

  await toast.promise(mutate({ color: color.value, name: name.value }), {
    pending: 'Loading...',
    success: 'Successfuly created!',
    error: 'Something went wrong...',
  });
}
</script>

<template>
  <div class="m-12">
    <div class="flex">
      <button
        class="text-4xl mb-5 transition duration-150 ease-in-out hover:scale-125"
        @click="router.back()"
      >
        🔙
      </button>

      <div class="ml-5 text-xl">Create a new Category!</div>
    </div>
    <div>
      <div class="flex flex-col mt-4">
        <div class="flex flex-col">
          <div>Name:</div>
          <input class="border border-1 w-[15rem]" v-model="name" />
        </div>
        <div class="flex flex-col mt-2">
          <div class="flex space-x-2">
            <div>Color:</div>
            <input type="color" v-model="color" />
          </div>
          <input class="border border-1 w-[15rem]" v-model="color" />
          <p class="text-xs opacity-50">
            👆 You can pick a color or type in the hex code
          </p>
        </div>

        <button
          @click="submit"
          class="w-fit mt-10 border border-1 rounded-sm bg-green-100 hover:bg-green-200 border-black py-1 px-2 transition duration-50 ease-in-out hover:scale-110"
        >
          Create Category
        </button>
      </div>
    </div>
  </div>
</template>
