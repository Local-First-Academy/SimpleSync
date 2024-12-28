export default function LocalTodos({ html, state }) {
  const { items, canViewTodos, username } = state.store;

  if (!canViewTodos) {
    return html`<div>
      <form action="/login" method="post">
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>`;
  }

  const todoItems = items
    .map(
      (item) =>
        html`<todo-item
          text="${item.text}"
          completed="${item.completed}"
          id="${item.key}"
        ></todo-item>`
    )
    .join("");

  console.log("todoItems", todoItems);

  return html`
    <div>Local Todos</div>
    <form id="todo-form">
        <input name="text" type="text" placeholder="Todo" required />
        <button type="submit">Add</button>
    </form>
    <ul id="todo-list">
    ${todoItems}
    </ul>
    <script src="/_public/browserDB.mjs"></script>
    <script src="/_public/sync.mjs"></script>
    <script type="module">
    // Get form and list elements
    const form = document.getElementById('todo-form');

    // Initialize DB and load existing todos
    console.log("initDB");
    await initDB();
    console.log("renderTodos");
    renderTodos();

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const text = formData.get('text');
        
        const todo = {
            text,
            completed: false
        };

        const newTodo = await addTodo(todo);
        renderTodos();
        form.reset();
    });

    // Make these functions available to the inline handlers
    window.toggleTodo = async (id, completed) => {
        await updateTodo(id, { completed, synced: false });
    };

    window.deleteTodoItem = async (id) => {
        await deleteTodo(id);
        renderTodos();
    };

    // Start background sync if user is logged in
    const syncInterval = startBackgroundSync("${username}");

    `;
}
