import { randomBytes, randomUUID, scryptSync } from "node:crypto";

import { Client } from "pg";

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${derivedKey}`;
}

const email = readArg("--email");
const password = readArg("--password");
const username = readArg("--username");
const displayName = readArg("--display-name");
const role = readArg("--role") ?? "user";
const databaseUrl = process.env.DATABASE_URL || "postgresql://marusya@127.0.0.1:54329/marusya_ai";

if (!email || !password) {
  console.error("Usage: npm run db:user:create -- --email user@example.com --password secret123 [--username user] [--display-name Name] [--role admin]");
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
});

await client.connect();

try {
  const passwordHash = hashPassword(password);

  await client.query(
    `INSERT INTO users (
      id,
      email,
      username,
      password_hash,
      display_name,
      role,
      status,
      email_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, 'active', TRUE)`,
    [
      randomUUID(),
      email.trim().toLowerCase(),
      username,
      passwordHash,
      displayName,
      role,
    ],
  );

  console.log(`User created: ${email.trim().toLowerCase()}`);
} finally {
  await client.end();
}
