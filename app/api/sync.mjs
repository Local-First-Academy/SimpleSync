import data from "@begin/data";

export async function post(req) {
  try {
    const { todos } = req.body;

    // Store each todo in Begin/Data
    await Promise.all(
      todos.map(async (todo) => {
        return await data.set({
          table: "todos",
          key: todo.id,
          ...todo,
          updatedAt: Date.now(),
        });
      })
    );

    return {
      statusCode: 200,
      json: {
        ok: true,
        success: true,
      },
    };
  } catch (error) {
    console.error("Sync error:", error);
    return {
      statusCode: 500,
      json: {
        error: "Failed to sync todos",
        message: error.message,
      },
    };
  }
}
