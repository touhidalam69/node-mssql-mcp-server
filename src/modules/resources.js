const { getPool } = require("../db/connection");
const { resourceUriSchema, dbKeySchema, validate } = require("../validation");

const resourceCache = new Map();

/**
 * Lists available tables (resources) from the SQL Server database.
 * Accepts optional dbKey for multi-database support.
 * @param {string} [dbKey] - Optional database key.
 * @returns {Promise<Array<Object>>} An array of resource objects.
 */
async function listResources(dbKey) {
  const cacheKey = dbKey || "default";
  if (resourceCache.has(cacheKey)) {
    return resourceCache.get(cacheKey);
  }

  try {
    if (dbKey) {
      validate(dbKeySchema, { dbKey });
    }

    const pool = await getPool(dbKey);
    const result = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);

    const resources = result.recordset.map((row) => ({
      uri: `mssql://${row.TABLE_NAME}/data`,
      name: `Table: ${row.TABLE_NAME}`,
      description: `Data in table: ${row.TABLE_NAME}`,
      mimeType: "text/plain",
    }));

    resourceCache.set(cacheKey, resources);
    // Invalidate cache after 5 minutes
    setTimeout(() => resourceCache.delete(cacheKey), 5 * 60 * 1000);

    return resources;
  } catch (error) {
    console.error(`Failed to list resources: ${error.message}`);
    return [];
  }
}

/**
 * Reads data from a specified table.
 * Accepts optional dbKey for multi-database support.
 * @param {string} uri - The resource URI (format: "mssql://<table>/data").
 * @param {string} [dbKey] - Optional database key.
 * @returns {Promise<string>} CSV-formatted data including headers.
 * @throws {Error} If the URI is invalid or the query fails.
 */
async function readResource(uri, dbKey) {
  try {
    const validUri = validate(resourceUriSchema, uri);

    if (dbKey) {
      validate(dbKeySchema, { dbKey });
    }

    if (!validUri.startsWith("mssql://")) {
      throw new Error(`Invalid URI scheme: ${validUri}`);
    }

    const parts = validUri.slice(8).split("/");
    const table = parts[0];

    const pool = await getPool(dbKey);
    const result = await pool
      .request()
      .query(`SELECT TOP 100 * FROM [${table}]`);

    const columns =
      result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [];
    const csvRows = [];

    csvRows.push(columns.join(","));

    result.recordset.forEach((row) => {
      const rowValues = columns.map((col) => {
        const value = row[col];
        if (value === null || value === undefined) {
          return "";
        }
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(rowValues.join(","));
    });
    return csvRows.join("\n");
  } catch (error) {
    console.error(`Database error reading resource ${uri}: ${error.message}`);
    throw new Error(`Database error: ${error.message}`);
  }
}

module.exports = {
  listResources,
  readResource,
};
