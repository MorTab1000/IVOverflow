# IVOverflow

IVOverflow is a secure, production-grade developer Q&A application inspired by Stack Overflow. It was built across three logical delivery stages: authentication and questions, answers, and voting. The result is a full-stack interview assignment that demonstrates clean product iteration, typed API boundaries, server-side data ownership, accessibility, security hardening, and reviewer-friendly developer experience.

Developers can log in with seeded users, ask tagged questions, answer questions, and vote answers up or down. Votes are enforced as one vote per user per answer, answers are sorted by server-computed score, and question/answer bodies support Prism.js syntax highlighting for fenced code snippets.

## Architecture & Tech Stack

IVOverflow is structured as a monorepo with clear separation between `client/` and `server/`. This keeps frontend and backend concerns isolated while still allowing shared project-level workflows, documentation, CI, and development scripts.[^1]

| Layer    | Stack                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Frontend | React, Redux Toolkit, RTK Query, CSS Modules, Prism.js via `RichBody`    |
| Backend  | Node.js, Express, TypeScript, Helmet, CORS hardening                     |
| ORM      | Prisma                                                                   |
| Database | PostgreSQL via Docker Compose                                            |
| Auth     | JWT with 1-hour expiration, fail-fast `JWT_SECRET`, protected API routes |
| Testing  | Vitest + Supertest backend integration tests                             |

### High-Level Flow

```text
React + RTK Query
  -> Express REST API + JWT middleware
  -> Prisma ORM
  -> PostgreSQL
```

## Dev Experience & Quality Controls

- Local pre-commit quality gate with Husky + lint-staged, running ESLint fixes and Prettier on staged files.[^1]
- GitHub Actions CI validates both packages on every push and PR: server lint/test/build and client lint/build.[^2]
- Backend integration coverage includes authentication, questions, answers, health, and voting behavior, with 33 passing tests.[^3]
- RTK Query cache invalidation keeps the UI synchronized after creating questions, posting answers, and voting.
- Security polish includes Helmet, restricted CORS, Prisma parameterized access, JWT validation, and no hardcoded JWT fallback secret.

## Prerequisites

Install these before running the app locally:

- Node.js 18+
- Docker Desktop

## Setup & Run Instructions

From the repository root:

```bash
npm install
```

Create a local server environment file if it does not already exist:

```bash
cp server/.env.example server/.env
```

Start PostgreSQL:

```bash
docker compose up -d
```

Prepare the database and seed test users:

```bash
cd server && npx prisma migrate dev && npx prisma db seed
cd ..
```

Boot the full application from the root directory:

```bash
npm run dev
```

The app will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Hardcoded Testing Credentials

Seeded users are created by `server/prisma/seed.ts`. Use any of these credentials to log in immediately:

| Name          | Email              | Password      |
| ------------- | ------------------ | ------------- |
| Alice Cohen   | `alice@ivtech.dev` | `password123` |
| Bob Levi      | `bob@ivtech.dev`   | `password123` |
| Carol Mizrahi | `carol@ivtech.dev` | `password123` |

## Feature Summary

### Stage 1: Authentication & Questions

- JWT login with hardcoded seeded users
- SHA-512 password hashing per assignment requirements
- Protected routes and authenticated API access
- Ask Question modal available globally inside authenticated routes
- Question list and detail pages

### Stage 2: Answers

- Submit answers on the question detail page
- Display answer author and timestamp
- Server-side answer ordering by creation time before voting is introduced

### Stage 3: Voting

- Upvote, downvote, flip vote, and cancel same-value vote
- One vote per user per answer enforced at the database level
- Server-computed `score` and `myVote` fields returned with answers
- Answers sorted by `score DESC`, then `createdAt ASC`
- Accessible voting controls with active states and double-submit protection

## Useful Commands

```bash
# Root
npm run dev
npm run format:check

# Server
cd server
npm run lint
npm test
npm run build

# Client
cd client
npm run lint
npm run build
```

## Notes for Reviewers

- The backend returns consistent JSON envelopes: `{ data }` on success and `{ error }` on failure.
- All protected API calls require `Authorization: Bearer <token>`.
- `GET /getQuestionAnswer` is the source of truth for vote score ordering; the frontend intentionally does not re-sort answers.
- Fenced code blocks in question and answer bodies are highlighted with Prism.js, for example:

````text
```typescript
const answer = "Use Prisma and RTK Query";
```
````

[^1]: See `architecture.md` for the full architecture, source layout, and local development model.

[^2]: See `.github/workflows/ci.yml` for the CI pipeline definition.

[^3]: The final backend suite contains 33 passing Vitest/Supertest tests across health, auth, questions, answers, and voting.
