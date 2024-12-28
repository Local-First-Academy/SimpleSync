import data from "@begin/data";

export const post = [createTodo];

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function createTodo(req) {
  const { text } = req.body;
  const username = req.session.username;
  const id = generateId();

  await data.set({
    table: "todos",
    key: id,
    text,
    completed: false,
    userId: username,
  });

  return {
    location: "/",
  };
}
