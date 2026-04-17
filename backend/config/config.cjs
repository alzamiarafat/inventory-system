require("dotenv").config();

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optionalInt(name, fallback) {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) throw new Error(`Env var ${name} must be an integer`);
  return n;
}

const base = {
  dialect: "postgres",
  logging: process.env.DB_LOGGING === "true",
  seederStorage: "sequelize",
};

module.exports = {
  development: {
    ...base,
    host: process.env.DB_HOST || "127.0.0.1",
    port: optionalInt("DB_PORT", 5432),
    database: process.env.DB_NAME || "sneaker_drop",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },
  test: {
    ...base,
    host: process.env.DB_HOST || "127.0.0.1",
    port: optionalInt("DB_PORT", 5432),
    database: process.env.DB_NAME || "sneaker_drop_test",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    logging: false,
  },
  production: {
    ...base,
    // For Neon/Vercel it's common to provide DATABASE_URL.
    use_env_variable: "DATABASE_URL",
    dialectOptions:
      process.env.DATABASE_SSL === "true"
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
  },
};
