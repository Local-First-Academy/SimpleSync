import data from "@begin/data";

export async function post(req) {
  const { username, password } = req.body;

  // Get user from DB
  const user = await data.get({
    table: "users",
    key: `user#${username}`,
  });

  if (!user) {
    // User doesn't exist - create new user
    const { hash, salt } = hashPassword(password);
    const newUser = {
      key: `user#${username}`,
      username,
      hash,
      salt,
    };

    await data.set({
      table: "users",
      ...newUser,
    });

    // Create session for new user
    const token = createSession(newUser.key);
    return {
      session: { token, username },
      location: "/",
    };
  }

  // User exists - verify password
  if (!verifyPassword(password, user.hash, user.salt)) {
    return {
      statusCode: 401,
      json: { error: "Invalid credentials" },
    };
  }

  // Create session for existing user
  const token = createSession(user.key);
  return {
    session: { token, username },
    location: "/",
  };
}

import crypto from "crypto";

export function hashPassword(password, salt = null) {
  // Generate a random salt if not provided
  salt = salt || crypto.randomBytes(16).toString("hex");

  // Create hash
  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      1000, // iterations
      64, // key length
      "sha512"
    )
    .toString("hex");

  return {
    hash,
    salt,
  };
}

export function verifyPassword(password, hash, salt) {
  const verifyHash = hashPassword(password, salt);
  return verifyHash.hash === hash;
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Store session tokens in memory (in production you'd want to use Redis/etc)
const sessions = new Map();

export function createSession(userId) {
  const token = generateSessionToken();
  sessions.set(token, {
    userId,
    createdAt: Date.now(),
  });
  return token;
}

export function validateSession(token) {
  const session = sessions.get(token);
  if (!session) return null;

  // Optional: Check if session is expired
  const hourInMs = 60 * 60 * 1000;
  if (Date.now() - session.createdAt > 24 * hourInMs) {
    sessions.delete(token);
    return null;
  }

  return session.userId;
}

export function clearSession(token) {
  sessions.delete(token);
}
