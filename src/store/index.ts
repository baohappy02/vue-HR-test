import { createStore } from "vuex";

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export interface State {
  todos: Todo[];
  visibility: VisibilityFilter;
  editedTodo: Todo | null;
}

type VisibilityFilter = "all" | "active" | "completed";

const STORAGE_KEY = "vue-todomvc";

const filters: Record<VisibilityFilter, (todos: Todo[]) => Todo[]> = {
  all: (todos: Todo[]) => todos,
  active: (todos: Todo[]) => todos.filter((todo) => !todo.completed),
  completed: (todos: Todo[]) => todos.filter((todo) => todo.completed),
};

export default createStore<State>({
  state: {
    todos: [],
    visibility: "all",
    editedTodo: null,
  },
  getters: {
    filteredTodos: (state) => filters[state.visibility](state.todos),
    remaining: (state) => filters.active(state.todos).length,
  },
  mutations: {
    setTodos: (state, todos: Todo[]) => {
      state.todos = todos;
    },
    addTodo: (state, todo: Todo) => {
      state.todos.push(todo);
    },
    removeTodo: (state, todo: Todo) => {
      const index = state.todos.indexOf(todo);
      if (index > -1) state.todos.splice(index, 1);
    },
    toggleAll: (state, completed: boolean) => {
      state.todos = state.todos.map((todo) => ({
        ...todo,
        completed,
      }));
    },
    setVisibility: (state, visibility: VisibilityFilter) => {
      state.visibility = visibility;
    },
    setEditedTodo: (state, todo: Todo | null) => {
      state.editedTodo = todo;
    },
    updateTodoTitle: (
      state,
      { todo, title }: { todo: Todo; title: string }
    ) => {
      todo.title = title.trim();
      if (!todo.title) {
        const index = state.todos.indexOf(todo);
        if (index > -1) state.todos.splice(index, 1);
      }
    },
    cancelEdit: (state, todo: Todo) => {
      if (state.editedTodo) {
        todo.title = state.editedTodo.title;
      }
      state.editedTodo = null;
    },
    removeCompleted: (state) => {
      state.todos = filters.active(state.todos);
    },
  },
  actions: {
    initializeTodos: ({ commit }) => {
      try {
        const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        commit("setTodos", todos);
      } catch (error) {
        console.error("Failed to parse todos from localStorage:", error);
      }
    },
    persistTodos: ({ state }) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
      } catch (error) {
        console.error("Failed to save todos to localStorage:", error);
      }
    },
  },
});
