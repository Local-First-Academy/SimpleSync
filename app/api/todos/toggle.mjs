import data from "@begin/data";

export const post = [toggleTodo];

async function toggleTodo(req) {
  const { todoId, completed, text } = req.body;

  await data.set({
    table: "todos",
    key: todoId,
    completed: completed === "on" ? true : false,
    userId: req.session.username,
    text: text,
  });

  return {
    location: "/",
  };
}
