import { data } from "@begin/data";
import { hashPassword } from "../lib/auth.mjs";

export async function post(req) {
  const { username, password } = req.body;

  // Check if user exists
  const existing = await data.get({
    table: "users",
    key: `user#${username}`,
  });

  if (existing) {
    return {
      statusCode: 409,
      json: { error: "Username already taken" },
    };
  }

  // Hash password and create user
  const { hash, salt } = hashPassword(password);

  await data.set({
    table: "users",
    key: `user#${username}`,
    username,
    hash,
    salt,
  });

  return {
    json: { message: "User created successfully" },
  };
}
