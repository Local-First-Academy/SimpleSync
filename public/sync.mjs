async function syncTodos(username) {
  try {
    // Get all unsynced todos
    const unsynced = await getUnsynced();

    // Send unsynced todos to server
    const todosWithUser = unsynced.map((todo) => ({
      ...todo,
      userId: username,
    }));

    const response = await fetch("/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        todos: todosWithUser,
      }),
    });

    if (!response.ok) {
      throw new Error("Sync failed");
    }

    // Mark all synced todos as synced locally
    for (const todo of unsynced) {
      await updateTodo(todo.id, { synced: true });
    }

    return true;
  } catch (err) {
    console.error("Sync failed:", err);
    return false;
  }
}

// Start background sync
function startBackgroundSync(username, interval = 10000) {
  return setInterval(() => syncTodos(username), interval);
}
