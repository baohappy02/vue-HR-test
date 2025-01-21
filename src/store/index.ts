import { createStore } from "vuex";

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface State {
  todos: Todo[];
  todosCreated: Todo[];
  visibility: VisibilityFilter;
  editedTodo: Todo | null;
}

export enum VisibilityFilter {
  All = "all",
  Active = "active",
  Completed = "completed",
}

const STORAGE_KEY = "vue-todos";
const CREATED_STORAGE_KEY = "vue-todos-created";

const filters: Record<VisibilityFilter, (todos: Todo[]) => Todo[]> = {
  [VisibilityFilter.All]: (todos: Todo[]) => todos,
  [VisibilityFilter.Active]: (todos: Todo[]) =>
    todos.filter((todo) => !todo.completed),
  // not return todo.completed to show UI with all the todos
  [VisibilityFilter.Completed]: (todos: Todo[]) =>
    todos.filter((todo) => todo),
};

export default createStore<State>({
  state: {
    todos: [],
    todosCreated: [],
    visibility: VisibilityFilter.All,
    editedTodo: null,
  },
  getters: {
    filteredTodos: (state) => filters[state.visibility](state.todos),
    remaining: (state) => filters[VisibilityFilter.Active](state.todos).length,
    allCreatedTodos: (state) => state.todosCreated,
    totalCreatedTodos: (state) => state.todosCreated.length,
  },
  mutations: {
    setTodos: (state, todos: Todo[]) => {
      state.todos = todos;
    },
    setTodosCreated: (state, todosCreated: Todo[]) => {
      state.todosCreated = todosCreated;
    },
    addTodo: (state, todo: Todo) => {
      const newTodo = { ...todo, createdAt: new Date() };

      state.todosCreated.push(newTodo);
      state.todos.push(newTodo);
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
      state.todos = filters[VisibilityFilter.Active](state.todos);
    },
  },
  actions: {
    initializeTodos: ({ commit }) => {
      try {
        const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        const todosCreated = JSON.parse(
          localStorage.getItem(CREATED_STORAGE_KEY) || "[]"
        );
        commit("setTodos", todos);
        commit("setTodosCreated", todosCreated);
      } catch (error) {
        console.error("Failed to parse todos from localStorage:", error);
      }
    },
    persistTodos: ({ state }) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
        localStorage.setItem(
          CREATED_STORAGE_KEY,
          JSON.stringify(state.todosCreated)
        );
      } catch (error) {
        console.error("Failed to save todos to localStorage:", error);
      }
    },
  },
});
