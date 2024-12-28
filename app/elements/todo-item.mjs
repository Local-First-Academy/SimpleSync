export default function TodoItem({ html, state }) {
  const { attrs } = state;

  const { text, completed, id } = attrs;

  return html`<li>
    <form action="/todos/toggle" method="POST">
      <input
        name="completed"
        type="checkbox"
        ${completed ? "checked" : ""}
        onchange="this.form.submit()"
      />
      <label>${text}</label>
      <input name="todoId" value="${id}" hidden />
      <input name="text" value="${text}" hidden />
    </form>
  </li>`;
}
