import mysql from "mysql2/promise";
import { env } from "./env.js";

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  ssl: env.db.ssl ? { rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  namedPlaceholders: true,
  dateStrings: false,
  timezone: "Z",
});

// Every connection in the pool runs in UTC so CURRENT_TIMESTAMP column
// defaults and explicit UTC_TIMESTAMP() calls agree, regardless of the MySQL
// server's own configured time zone.
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

export async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Runs `fn` with a single dedicated connection inside a transaction,
 * committing on success and rolling back on any thrown error. Every
 * multi-row write in this codebase (order placement, quote acceptance,
 * payout processing) goes through this so partial writes can't happen.
 */
export async function withTransaction(fn) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function checkDbConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.query("SELECT 1");
  } finally {
    conn.release();
  }
}
