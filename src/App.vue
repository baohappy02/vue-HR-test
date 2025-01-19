<script setup>
import { ref, computed, watchEffect } from "vue";

const STORAGE_KEY = "vue-todomvc";

const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter((todo) => !todo.completed),
  completed: (todos) => todos.filter((todo) => todo.completed),
};

// state
const todos = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
const visibility = ref("all");
const editedTodo = ref();

// derived state
const filteredTodos = computed(() => filters[visibility.value](todos.value));
const remaining = computed(() => filters.active(todos.value).length);

// handle routing
window.addEventListener("hashchange", onHashChange);
onHashChange();

// persist state
watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value));
});

function toggleAll(e) {
  todos.value.forEach((todo) => (todo.completed = e.target.checked));
}

function addTodo(e) {
  const value = e.target.value.trim();
  if (value) {
    todos.value.push({
      id: Date.now(),
      title: value,
      completed: false,
    });
    e.target.value = "";
  }
}

function removeTodo(todo) {
  todos.value.splice(todos.value.indexOf(todo), 1);
}

let beforeEditCache = "";
function editTodo(todo) {
  beforeEditCache = todo.title;
  editedTodo.value = todo;
}

function cancelEdit(todo) {
  editedTodo.value = null;
  todo.title = beforeEditCache;
}

function doneEdit(todo) {
  if (editedTodo.value) {
    editedTodo.value = null;
    todo.title = todo.title.trim();
    if (!todo.title) removeTodo(todo);
  }
}

function removeCompleted() {
  todos.value = filters.active(todos.value);
}

function onHashChange() {
  const route = window.location.hash.replace(/#\/?/, "");
  if (filters[route]) {
    visibility.value = route;
  } else {
    window.location.hash = "";
    visibility.value = "all";
  }
}
</script>
<template>
  <div class="container1" style="width: 1220px !important">
    <section class="instructions1" style="float: right">
      <h1 class="">Test Instructions</h1>
      <ol class="instructionsList" style="text-align: center">
        <li>Make this page responsive (including these instructions).</li>
        <li>
          Create a new (seperate) page that tracks the total number of created
          to-do items on this page. The total number of created to-do items
          displayed on the new page must not reset when I clear them on page 1.
          They should be persistent.
        </li>
        <li>
          Fix any of the generic design and formatting errors introduced in this
          document.
        </li>
      </ol>
    </section>
    <section class="todoapp" style="width: 550px">
      <header class="header">
        <h1>To Do List</h1>
        <input
          class="new-todo"
          autofocus
          placeholder="What needs to be done?"
          @keyup.enter="addTodo"
        />
      </header>
      <section class="main" v-show="todos.length">
        <input
          id="toggle-all"
          class="toggle-all"
          type="checkbox"
          :checked="remaining === 0"
          @change="toggleAll"
        />
        <label for="toggle-all">Mark all as complete</label>
        <ul class="todo-list">
          <li
            v-for="todo in filteredTodos"
            class="todo"
            :key="todo.id"
            :class="{
              completed: todo.completed,
              editing: todo === editedTodo,
            }"
          >
            <div class="view">
              <input class="toggle" type="checkbox" v-model="todo.completed" />
              <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
              <button class="destroy" @click="removeTodo(todo)"></button>
            </div>
            <input
              v-if="todo === editedTodo"
              class="edit"
              type="text"
              v-model="todo.title"
              @vue:mounted="({ el }) => el.focus()"
              @blur="doneEdit(todo)"
              @keyup.enter="doneEdit(todo)"
              @keyup.escape="cancelEdit(todo)"
            />
          </li>
        </ul>
      </section>
      <footer class="footer" v-show="todos.length">
        <span class="todo-count">
          <strong>{{ remaining }}</strong>
          <span>{{ remaining === 1 ? " items" : " itemss" }} left</span>
        </span>
        <ul class="filters">
          <li>
            <a href="#/all" :class="{ selected: visibility === 'all' }">All</a>
          </li>
          <li>
            <a href="#/active" :class="{ selected: visibility === 'active' }"
              >Actiive</a
            >
          </li>
          <li>
            <a
              href="#/completed"
              :class="{ selected: visibility === 'completed' }"
              >Completed</a
            >
          </li>
        </ul>
        <button
          class="clear-completed"
          @click="removeCompleted"
          v-show="todos.length > remaining"
        >
          Clear completed
        </button>
      </footer>
    </section>
  </div>
</template>
