# Contributing to mssql-mcp-server

First off, thank you for considering contributing! Your help is greatly appreciated. This document provides a set of guidelines for contributing to this project.

## Code of Conduct

This project and everyone participating in it is governed by a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/touhidalam69/node-mssql-mcp-server/issues). If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for an enhancement, please open an issue to discuss it. This allows us to coordinate our efforts and prevent duplication of work.

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through `good first issue` and `help wanted` issues.

### Pull Requests

1.  **Fork the repository** and create your branch from `main`.
2.  **Set up your development environment:**
    - Clone your forked repository.
    - Run `npm install` to install all the necessary dependencies.
    - Create a `.env` file in the root of the project. You can copy the `.env.example` file and fill in the necessary values for your local database setup.
3.  **Make your changes** in a new git branch.
4.  **Run the tests** by executing `npm test` to ensure that your changes do not break existing functionality.
5.  **Commit your changes** and push your branch to your fork.
6.  **Open a pull request** to the `main` branch of the main repository.
7.  **Describe your changes** clearly in the pull request description.

## Styleguides

We use Prettier and ESLint to maintain a consistent code style. Please ensure your code adheres to the project's style by running the linter and formatter before committing.

- **Lint:** `npm run lint` (You may need to add this script to `package.json`)
- **Format:** `npm run format` (You may need to add this script to `package.json`)

We look forward to your contributions!
