const DB_NAME = "local-todos";
const STORE_NAME = "todos";

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
  });
}

async function addTodo(todo) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const todoWithMeta = {
      ...todo,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
      synced: false,
    };
    const request = store.add(todoWithMeta);

    request.onsuccess = () => resolve(todoWithMeta);
    request.onerror = () => reject(request.error);
  });
}

async function updateTodo(id, updates) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const todo = request.result;
      const updatedTodo = {
        ...todo,
        ...updates,
        updatedAt: Date.now(),
      };
      store.put(updatedTodo);
      resolve(updatedTodo);
    };
    request.onerror = () => reject(request.error);
  });
}

async function deleteTodo(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getUnsynced() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const todos = request.result;
      resolve(todos.filter((todo) => !todo.synced));
    };
    request.onerror = () => reject(request.error);
  });
}

async function getAllTodos() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Render todos from IndexedDB
async function renderTodos() {
  const todos = await getAllTodos();
  const todoList = document.getElementById("todo-list");

  todoList.innerHTML = todos
    .map(
      (todo) => `
        <li data-id="${todo.id}">
          <input type="checkbox" ${todo.completed ? "checked" : ""} 
            onchange="toggleTodo('${todo.id}', this.checked)">
          <span>${todo.text}</span>
          <button onclick="deleteTodoItem('${todo.id}')">Delete</button>
        </li>
      `
    )
    .join("");
}
