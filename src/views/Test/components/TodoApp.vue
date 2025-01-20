<script setup lang="ts">
import { computed, ref, watchEffect, onMounted } from "vue";
import { useStore } from "vuex";
import type { Todo, State } from "@/store";

const store = useStore<State>();

// Derived state using Vuex getters
const todos = computed(() => store.state.todos);
const filteredTodos = computed(() => store.getters.filteredTodos);
const remaining = computed(() => store.getters.remaining);
const visibility = ref(store.state.visibility);

// Watch for changes in Vuex state to update visibility
watchEffect(() => {
  store.commit(
    "setVisibility",
    visibility.value as "all" | "active" | "completed"
  );
});

// Actions and mutations
const toggleAll = (e: Event) => {
  const target = e.target as HTMLInputElement;
  store.commit("toggleAll", target.checked);
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
  if (["all", "active", "completed"].includes(route)) {
    visibility.value = route as "all" | "active" | "completed";
  } else {
    window.location.hash = "";
    visibility.value = "all";
  }
};

onMounted(() => {
  store.dispatch("initializeTodos");
  window.addEventListener("hashchange", onHashChange);
  onHashChange();
});
</script>

<template>
  <section
    class="mx-auto lg:mt-10 lg:max-w-[80%] lg:rounded-lg lg:border border-cus3 bg-white p-5 pb-7 lg:p-6"
  >
    <header class="">
      <h1 class="text-2xl font-bold text-center lg:text-left">
        To Do List

        <span v-show="todos.length" class="text-[12px]">
          (<strong class="text-sm">{{ remaining }}</strong>
          <span class="text-[12px]"
            >{{ remaining === 1 ? " item" : " items" }} left</span
          >)
        </span>
      </h1>

      <div v-show="todos.length">
        <ul>
          <li>
            <a href="#all" :class="{ selected: visibility === 'all' }">All</a>
          </li>
          <li>
            <a href="#active" :class="{ selected: visibility === 'active' }"
              >Active</a
            >
          </li>
          <li>
            <a
              href="#completed"
              :class="{ selected: visibility === 'completed' }"
              >Completed</a
            >
          </li>
        </ul>
        <button @click="removeCompleted" v-show="todos.length > remaining">
          Clear completed
        </button>
      </div>
    </header>

    <input
      class=""
      autofocus
      placeholder="What needs to be done?"
      @keyup.enter="addTodo"
    />

    <section class="" v-show="todos.length">
      <label
        >Mark all as complete
        <input
          class=""
          type="checkbox"
          :checked="remaining === 0"
          @change="toggleAll"
      /></label>
      <ul class="">
        <li
          v-for="todo in filteredTodos"
          class=""
          :key="todo.id"
          :class="{
            completed: todo.completed,
            editing: todo === store.state.editedTodo,
          }"
        >
          <div class="view">
            <input
              class="toggle"
              type="checkbox"
              v-model="todo.completed"
              @change="store.dispatch('persistTodos')"
            />
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input
            v-if="todo === store.state.editedTodo"
            class="edit"
            type="text"
            v-model="todo.title"
            @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)"
            @keyup.escape="cancelEdit(todo)"
          />
        </li>
      </ul>
    </section>
  </section>
</template>
