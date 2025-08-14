# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version     | Supported          |
|-------------|--------------------|
| latest (main branch) | ✅ |
| older versions        | ❌ |

If you are running an outdated version, please update to the latest commit from the `main` branch to ensure you have the latest security fixes.

---

## Reporting a Vulnerability

If you discover a security vulnerability in node-mssql-mcp-server, please help us keep the community safe by following these steps:

1. **Do not** create a public GitHub issue for the vulnerability.
2. Email your report to:

   touhidalam69@gmail.com

3. Include:
   - A detailed description of the vulnerability.
   - Steps to reproduce the issue.
   - Possible impact.
   - Suggested fix (if you have one).

4. We will acknowledge your report within **48 hours** and provide an estimated timeline for a fix.

---

## Security Guidelines

- **Do not** submit malicious SQL queries or payloads to the public demo (if any).
- Keep your `.env` file secure — it contains sensitive database credentials.
- Always run in `IS_READONLY=true` mode unless you fully trust your SQL queries.
- Avoid committing database connection details to version control.

---

## Responsible Disclosure

We strongly believe in responsible disclosure and will always credit security researchers who report valid vulnerabilities following this policy.

Thank you for helping make node-mssql-mcp-server more secure!
