# versioning-demo

A Fastify TypeScript project demonstrating API versioning strategies.

## Project Structure

```
src/
├── index.ts                 # Main server entry point
├── routes/
│   ├── semver/             # Semantic versioning routing
│   ├── uri/                # URI-based versioning
│   └── header/             # Header-based versioning
├── plugins/
│   ├── semverResolver.ts   # Semver version resolver plugin
│   └── dateVersionResolver.ts # Date-based version resolver plugin
├── schemas/
│   └── users.ts            # User schema definitions
└── services/
    └── users.ts            # User service logic
```

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify 4.28.0
- **Dev Tools**: ts-node, TypeScript 5.0

## Purpose

Demonstrates three API versioning approaches:
1. **Semantic Versioning** (semver): Version routes by major.minor.patch
2. **URI-based**: Version specified in URL path
3. **Header-based**: Version specified in HTTP headers

## Getting Started

```bash
npm install
npm run dev
```

Starts server with ts-node watching `src/index.ts`.

## Key Patterns

- Plugins encapsulate versioning logic (semverResolver, dateVersionResolver)
- Routes organized by versioning strategy
- Shared schemas and services across versions
