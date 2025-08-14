const sql = require("mssql");
const { dbConfigs } = require("../config");

const pools = {};

/**
 * Get a connection pool for the given dbKey.
 * If a pool doesn't exist, it will be created.
 * @param {string} [dbKey] - The database key.
 * @returns {Promise<sql.ConnectionPool>} A promise that resolves to a connection pool.
 */
async function getPool(dbKey) {
  const config = dbConfigs[dbKey] || Object.values(dbConfigs)[0];
  if (!config) {
    throw new Error("No database configuration found.");
  }

  const poolKey = dbKey || "default";

  if (!pools[poolKey]) {
    const pool = new sql.ConnectionPool(config);
    const close = pool.close.bind(pool);
    pool.close = (...args) => {
      delete pools[poolKey];
      return close(...args);
    };
    await pool.connect();
    pools[poolKey] = pool;
  }

  return pools[poolKey];
}

module.exports = { getPool };
