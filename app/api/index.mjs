import data from "@begin/data";

export async function get(req) {
  const username = req.session.username;

  const items = await data.get({ table: "todos" });
  const itemsArray = Array.isArray(items) ? items : items ? [items] : [];

  const userTodos = itemsArray.filter((item) => item.userId === username);

  if (!username) {
    return {
      json: {
        canViewTodos: false,
      },
    };
  }

  return {
    json: {
      canViewTodos: true,
      items: userTodos,
      username,
    },
  };
}
