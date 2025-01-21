<script setup lang="ts">
import { useStore } from "vuex";
import { computed, onMounted } from "vue";
import Layout from "../../components/Layout/index.vue";
import type { State } from "@/store";
import { formatDistance } from "date-fns";

const store = useStore<State>();

const allCreatedTodos = computed(() => store.getters.allCreatedTodos);

onMounted(() => {
  store.dispatch("initializeTodos");
});
</script>

<template>
  <Layout>
    <section
      class="mx-auto lg:mt-10 lg:max-w-[80%] lg:rounded-lg lg:border border-cus3 bg-white p-5 pb-7 lg:p-6"
    >
      <h1 class="text-2xl font-bold text-center lg:text-left">
        Total created

        <a
          href="/"
          class="text-[12px] font-normal text-purple underline underline-offset-2 ml-3"
          >Go back</a
        >
      </h1>
      <p>asda</p>

      <section
        v-show="allCreatedTodos.length"
        class="flex flex-col flex-wrap gap-3 mt-3"
        v
      >
        <ul class="grid grid-cols-3 gap-8 mt-3">
          <li
            v-for="(createdTodo, key) in allCreatedTodos"
            :key="key"
            class="flex flex-col items-start w-full gap-2 h-max"
          >
            <p class="text-[10px]">{{ formatDistance(createdTodo?.createdAt, new Date(), { addSuffix: true }) }}</p>
            <textarea
              disabled
              class="disabled:hover:text-[12px] disabled:leading-5 disabled:hover:ring-0 resize-none hover:resize-y text-pretty text-[12px] outline-none hover:text-sm focus:text-sm w-full h-12 max-h-[100px] p-1 hover:ring-2 focus:ring-2 ring-purple focus:rounded-sm hover:rounded-sm"
              type="text"
              v-model="createdTodo.title"
            />
          </li>
        </ul>
      </section>
    </section>
  </Layout>
</template>
