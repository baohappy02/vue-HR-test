<script setup lang="ts">
import { computed, ref, watchEffect, onMounted } from "vue";
import { useStore } from "vuex";
import type { Todo, State } from "@/store";
import { VisibilityFilter } from "@/store"; // Import the enum
import { useEventListener } from '@vueuse/core'

const store = useStore<State>();

// Derived state using Vuex getters
const todos = computed(() => store.state.todos);
const editedTodo = computed(() => store.state.editedTodo);
const filteredTodos = computed(() => store.getters.filteredTodos);
const remaining = computed(() => store.getters.remaining);
const visibility = ref(store.state.visibility);

// Watch for changes in Vuex state to update visibility
watchEffect(() => {
  store.commit("setVisibility", visibility.value as VisibilityFilter);
});

// Actions and mutations
const toggleAll = (e: Event) => {
  const target = e.target as HTMLInputElement;
  store.commit("toggleAll", target.checked);
};

const __displayTagName = (tag: string): string => {
  if (tag) return tag.charAt(0).toUpperCase() + tag.slice(1);
  return "";
};

// Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
};

const addTodo = (e: KeyboardEvent) => {
  const input = e.target as HTMLInputElement;
  const value = sanitizeInput(input.value.trim());
  if (value) {
    store.commit("addTodo", {
      id: Date.now(),
      title: value,
      completed: false,
    });
    input.value = "";
    store.dispatch("persistTodos");
  }
};

const removeTodo = (todo: Todo) => {
  store.commit("removeTodo", todo);
  store.dispatch("persistTodos");
};

const editTodo = (todo: Todo) => {
  store.commit("setEditedTodo", todo);
};

const cancelEdit = (todo: Todo) => {
  store.commit("cancelEdit", todo);
};

const doneEdit = (todo: Todo) => {
  const editedTodo = store.state.editedTodo;
  if (editedTodo) {
    store.commit("updateTodoTitle", { todo, title: todo.title.trim() });
    store.commit("setEditedTodo", null);
    store.dispatch("persistTodos");
  }
};

const removeCompleted = () => {
  store.commit("removeCompleted");
  store.dispatch("persistTodos");
};

// Handle routing
const onHashChange = () => {
  const route = window.location.hash.replace(/#\/?/, "");

  if (Object.values(VisibilityFilter).includes(route as VisibilityFilter)) {
    visibility.value = route as VisibilityFilter;
  } else {
    window.location.hash = "";
    visibility.value = VisibilityFilter.All;
  }
};

onMounted(() => {
  store.dispatch("initializeTodos");
});

useEventListener(window, 'hashchange', onHashChange)

</script>

<template>
  <section class="mx-auto lg:mt-10 lg:max-w-[80%] lg:rounded-lg lg:border border-cus3 bg-white p-5 pb-7 lg:p-6">
    <header class="flex flex-col flex-wrap gap-2">
      <h1 class="text-2xl font-bold text-center lg:text-left">
        To Do List

        <span v-show="todos.length" class="text-[12px]">
          (<strong class="text-sm">{{ remaining }}</strong>
          <span class="text-[12px]">{{ remaining === 1 ? " item" : " items" }} left</span>)
        </span>
      </h1>

      <ul v-show="todos.length" class="flex items-center gap-3 ml-auto">
        <li v-for="(filter, key) in Object.values(VisibilityFilter)" :key="key">
          <a :href="'#' + filter" :class="{
            'text-purple hover:underline underline-offset-2':
              visibility === filter,
          }">
            #{{ __displayTagName(filter) }}
          </a>
        </li>
      </ul>
    </header>

    <input class="w-full p-2 mt-3 border rounded-md outline-none focus:ring-2 ring-purple focus:rounded-md" autofocus
      placeholder="What needs to be done?" @keyup.enter="addTodo" />

    <section v-show="todos.length" class="flex flex-col flex-wrap gap-3 mt-3" v>
      <div class="flex flex-wrap items-center">
        <label class="flex items-center gap-2">
          <input class="outline-none size-5" type="checkbox" :checked="remaining === 0" @change="toggleAll" />
          <p class="font-medium text-md">Mark all as complete</p>
        </label>

        <button class="ml-auto font-medium underline text-md underline-offset-2 text-purple" @click="removeCompleted"
          v-show="todos.length > remaining">
          Clear completed
        </button>
      </div>

      <ul class="grid grid-cols-3 gap-8 mt-3">
        <li v-for="(todo, key) in filteredTodos" :key="key" class="flex items-start w-full gap-2 h-max" :class="{
          'line-through opacity-25': todo.completed,
          'text-purple-400': todo === editedTodo,
        }">
          <input class="flex-none mt-[6px] outline-none size-4" type="checkbox" v-model="todo.completed"
            @change="store.dispatch('persistTodos')" />
          <label @dblclick="editTodo(todo)" class="flex items-center w-full">
            <textarea
              class="disabled:hover:text-[12px] disabled:leading-5 disabled:hover:ring-0 resize-none hover:resize-y text-pretty text-[12px] outline-none hover:text-sm focus:text-sm w-full h-12 max-h-[100px] p-1 hover:ring-2 focus:ring-2 ring-purple focus:rounded-sm hover:rounded-sm"
              :class="{
                'text-purple-400 ring-2 ring-purple text-sm rounded-sm':
                  todo === editedTodo,
              }" type="text" v-model="todo.title" :disabled="todo.completed" @blur="doneEdit(todo)"
              @keyup.enter="doneEdit(todo)" @keyup.escape="cancelEdit(todo)" />
          </label>

          <button class="ml-auto" @click="removeTodo(todo)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M3 16.74L7.76 12L3 7.26L7.26 3L12 7.76L16.74 3L21 7.26L16.24 12L21 16.74L16.74 21L12 16.24L7.26 21zm9-3.33l4.74 4.75l1.42-1.42L13.41 12l4.75-4.74l-1.42-1.42L12 10.59L7.26 5.84L5.84 7.26L10.59 12l-4.75 4.74l1.42 1.42z" />
            </svg>
          </button>
        </li>
      </ul>
    </section>
  </section>
</template>