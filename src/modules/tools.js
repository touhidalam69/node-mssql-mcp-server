const { getPool } = require("../db/connection");
const {
  dbConfigs,
  getConnectionStatus,
} = require("../config/dbConfig");
const {
  dbKeyTableSchema,
  dbKeyQuerySchema,
  validate,
} = require("../validation");

/**
 * Lists available SQL Server tools.
 * @returns {Array<Object>} An array of tool objects.
 */
function listTools() {
  return [
    {
      name: "execute_sql",
      description:
        "Execute an SQL query on the SQL Server (multi-database support)",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The SQL query to execute",
          },
          dbKey: {
            type: "string",
            description:
              "The database key to use (e.g., 'maindb', 'reportingdb', etc.). Optional in single-db mode.",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_table_schema",
      description:
        "Retrieve the schema of a specified table (multi-database support)",
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "The name of the table",
          },
          dbKey: {
            type: "string",
            description:
              "The database key to use (e.g., 'maindb', 'reportingdb', etc.). Optional in single-db mode.",
          },
        },
        required: ["table"],
      },
    },
    {
      name: "list_databases",
      description: "List all configured databases in the application",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  ];
}

/**
 * Determines if a SQL query is safe to execute
 * @param {string} query - The SQL query to check
 * @returns {boolean} - Whether the query is considered safe
 */
function isSafeQuery(query) {
  const upperQuery = query.trim().toUpperCase();
  const unsafePatterns = [
    /\s*DROP\s+/i,
    /\s*TRUNCATE\s+/i,
    /\s*ALTER\s+ROLE\s+/i,
    /\s*CREATE\s+LOGIN\s+/i,
    /\s*ALTER\s+LOGIN\s+/i,
    /\s*CREATE\s+USER\s+/i,
    /\s*ALTER\s+USER\s+/i,
    /\s*EXEC(\s+|\s*\()/i,
    /\s*EXECUTE(\s+|\s*\()/i,
    /\s*xp_cmdshell/i,
    /\s*sp_configure/i,
    /\s*RECONFIGURE\s*/i,
    /\s*GRANT\s+/i,
    /\s*REVOKE\s+/i,
    /\s*DENY\s+/i,
  ];

  if (process.env.IS_READONLY === "true") {
    unsafePatterns.push(/\s*INSERT\s+/i, /\s*UPDATE\s+/i, /\s*DELETE\s+/i);
  }

  // Check if the query contains unsafe patterns
  for (const pattern of unsafePatterns) {
    if (pattern.test(upperQuery)) {
      return false;
    }
  }

  return true;
}

/**
 * Executes an SQL query and formats the results.
 * @param {string} query - The SQL query to execute.
 * @param {string} [dbKey] - The database key to select the config.
 * @returns {Promise<Object>} Response object with content array and isError flag.
 */
async function executeSql(query, dbKey) {
  try {
    const validationInput = { query };
    if (dbKey) {
      validationInput.dbKey = dbKey;
    }

    const validSchema = dbKey
      ? validate(dbKeyQuerySchema, validationInput)
      : validate(dbKeyQuerySchema.partial({ dbKey: true }), validationInput);
    const { query: validQuery } = validSchema;

    if (!isSafeQuery(validQuery)) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error:
                  "Query contains potentially unsafe operations and was blocked for security",
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    const pool = await getPool(dbKey);
    const result = await pool.request().query(validQuery);

    const normalizedResult = {
      message: "Query executed successfully",
      rowsAffected: result.rowsAffected[0],
      recordset: result.recordset,
    };

    return {
      content: [
        { type: "text", text: JSON.stringify(normalizedResult, null, 2) },
      ],
      isError: false,
    };
  } catch (error) {
    console.error(`Error executing SQL query: ${error.message}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Retrieves schema information for a specified table.
 * @param {string} table - The name of the table to get schema for.
 * @param {string} [dbKey] - The database key to select the config.
 * @returns {Promise<Object>} Response object with content array and isError flag.
 */
async function getTableSchema(table, dbKey) {
  try {
    const validationInput = { table };
    if (dbKey) {
      validationInput.dbKey = dbKey;
    }

    const validSchema = dbKey
      ? validate(dbKeyTableSchema, validationInput)
      : validate(dbKeyTableSchema.partial({ dbKey: true }), validationInput);

    const { table: validTable } = validSchema;

    const pool = await getPool(dbKey);
    const result = await pool.request()
      .input("tableName", validTable)
      .query(`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tableName
        ORDER BY ORDINAL_POSITION
      `);

    if (result.recordset.length === 0) {
      throw new Error(`Table '${validTable}' not found or has no columns`);
    }

    const normalizedResult = {
      table: validTable,
      columns: result.recordset,
    };

    return {
      content: [
        { type: "text", text: JSON.stringify(normalizedResult, null, 2) },
      ],
      isError: false,
    };
  } catch (error) {
    console.error(
      `Error retrieving schema for table '${table}': ${error.message}`
    );
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Lists all configured databases and their connection information.
 * Masks sensitive information like passwords.
 * @returns {Promise<Object>} Response object with database configurations.
 */
async function listDatabases() {
  try {
    // Create a sanitized copy of configurations (without passwords)
    const sanitizedConfigs = {};

    for (const [key, config] of Object.entries(dbConfigs)) {
      sanitizedConfigs[key] = {
        server: config.server,
        port: config.port || 1433,
        database: config.database,
        user: config.user,
        options: {
          encrypt: config.options.encrypt,
          trustServerCertificate: config.options.trustServerCertificate,
        },
      };
    }

    const statusInfo = getConnectionStatus();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              availableDatabases: Object.keys(dbConfigs),
              configurations: sanitizedConfigs,
              connectionStatus: statusInfo,
              count: Object.keys(dbConfigs).length,
              defaultDatabase: Object.keys(dbConfigs)[0],
            },
            null,
            2
          ),
        },
      ],
      isError: false,
    };
  } catch (error) {
    console.error(`Error listing databases: ${error.message}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

module.exports = {
  listTools,
  executeSql,
  getTableSchema,
  listDatabases,
};
