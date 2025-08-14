# Node.js MSSQL MCP Server

A Model Context Protocol (MCP) server for Microsoft SQL Server. This project allows MCP clients to interact with an MS SQL database, providing resources and tools to explore the database schema, execute SQL queries, and more. It also includes an HTTP server for clients that don't use the MCP protocol.

## Overview

This project is a Model Context Protocol (MCP) server that allows clients to interact with a Microsoft SQL Server database. It provides a set of resources and tools to explore the database schema, execute SQL queries, and more.

The server can be run in two modes:

*   **MCP Server over Stdio:** This is the primary mode of operation, designed for integration with MCP clients.
*   **HTTP Server:** An Express server that exposes the same functionality over an HTTP API.

## Features

*   Connect to one or more MS SQL Server databases.
*   List all tables in a database as MCP resources.
*   Read the top 100 rows from a table.
*   Execute SQL queries with a safety check to prevent dangerous operations.
*   Retrieve the schema of a table.
*   List all configured databases.

## Prerequisites

*   Node.js (v14 or later)
*   npm
*   A running Microsoft SQL Server instance

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/touhidalam69/node-mssql-mcp-server.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd node-mssql-mcp-server
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Configuration

The database connection is configured using environment variables in a `.env` file. You can create a `.env` file in the root of the project.

### Single Database Configuration

For a single database connection, use the following environment variables:

| Variable                        | Description                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `MSSQL_SERVER`                  | The IP address or hostname of the SQL Server instance.                                                                                     |
| `MSSQL_PORT`                    | The port number for the SQL Server instance. Defaults to `1433`.                                                                           |
| `MSSQL_USER`                    | The username for connecting to the SQL Server.                                                                                             |
| `MSSQL_PASSWORD`                | The password for the SQL Server user.                                                                                                      |
| `MSSQL_DATABASE`                | The name of the database to connect to.                                                                                                    |
| `MSSQL_ENCRYPT`                 | A boolean indicating whether to encrypt the connection. Set to `true` for production environments and Azure. Defaults to `false`.            |
| `MSSQL_TRUST_SERVER_CERTIFICATE`| A boolean indicating whether to trust the server's certificate. Set to `false` for production environments with a valid certificate. Defaults to `true`. |

```
MSSQL_SERVER=your_server_address
MSSQL_PORT=1433
MSSQL_USER=your_username
MSSQL_PASSWORD=your_password
MSSQL_DATABASE=your_database_name
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=true
```

### Multi-Database Configuration

For multiple database connections, use a prefix for each database. For example, for a database named `maindb` and another named `reportingdb`:

```
# Main Database
MSSQL_MAINDB_SERVER=your_server_address
MSSQL_MAINDB_PORT=1433
MSSQL_MAINDB_USER=your_username
MSSQL_MAINDB_PASSWORD=your_password
MSSQL_MAINDB_DATABASE=main_database_name

# Reporting Database
MSSQL_REPORTINGDB_SERVER=your_server_address
MSSQL_REPORTINGDB_PORT=1433
MSSQL_REPORTINGDB_USER=your_username
MSSQL_REPORTINGDB_PASSWORD=your_password
MSSQL_REPORTINGDB_DATABASE=reporting_database_name
```

## Running the Server

### MCP Server

To run the MCP server over stdio, use the following command:

```bash
npm start
```

### HTTP Server

To run the HTTP server, you will need to modify the `start` script in `package.json` to run `node src/server/index.js` or add a new script.

## API Documentation

### MCP Resources

*   **`mssql://<table>/data`**: Represents a table in the database. Reading this resource will return the top 100 rows from the table in CSV format.

### MCP Tools

*   **`execute_sql`**: Executes a SQL query.
    *   **Input:** `{ "query": "<sql-query>", "dbKey": "<database-key>" }`
*   **`get_table_schema`**: Retrieves the schema of a table.
    *   **Input:** `{ "table": "<table-name>", "dbKey": "<database-key>" }`
*   **`list_databases`**: Lists all configured databases.
    *   **Input:** `{}`

### HTTP API Endpoints

*   **`GET /resources`**: Lists all tables as resources.
*   **`GET /resource?uri=<uri>`**: Reads data from a resource.
*   **`GET /tools`**: Lists available tools.
*   **`GET /databases`**: Lists all configured databases.
*   **`POST /execute-sql`**: Executes an SQL query.
*   **`POST /get-table-schema`**: Retrieves the schema of a table.

## Testing

To run the test suite, use the following command:

```bash
npm test
```

## Claude Desktop Integration

The `claude_desktop_config.json` file is used to configure the MCP server when running it with the Claude Desktop application. This file defines how to start the server and provides the necessary environment variables for the database connection.

Here is an example configuration:

```json
{
  "mcpServers": {
    "mediasoft_customer_billing": {
      "command": "node",
      "args": [
        "your_project_path/src/index.js"
      ],
      "env": {
        "MSSQL_SERVER": "your_server_address",
        "MSSQL_PORT": "1433",
        "MSSQL_USER": "your_username",
        "MSSQL_PASSWORD": "your_password",
        "MSSQL_DATABASE": "your_database_name",
        "MSSQL_ENCRYPT": "false",
        "MSSQL_TRUST_SERVER_CERTIFICATE": "true"
      }
    }
  }
}
```

### Configuration Options

*   **`command`**: The command to execute to start the server (e.g., `node`).
*   **`args`**: An array of arguments to pass to the command. The first argument should be the path to the `src/index.js` file.
*   **`env`**: An object of environment variables to set for the server process. These variables are used to configure the database connection.

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

*   **Touhid Alam**
    *   Website: [https://touhidalam.com](https://touhidalam.com)
    *   GitHub: [@touhidalam69](https://github.com/touhidalam69)