# IVOverflow — Architecture

> **Status:** Approved — architectural decisions finalized  
> **Last updated:** 2026-07-12

## Overview

IVOverflow is a developer Q&A platform (Stack Overflow–style) where IVTech developers ask questions with code snippets, receive answers, and vote on answer quality. The system is built in three stages: authentication & questions → answers → voting.

## Tech Stack

| Layer     | Technology                                         |
| --------- | -------------------------------------------------- |
| Frontend  | ReactJS, Redux Toolkit, RTK Query                  |
| Backend   | Node.js, Express, TypeScript                       |
| ORM       | **Prisma**                                         |
| Database  | **PostgreSQL**                                     |
| Auth      | JWT (1-hour expiration, required on all API calls) |
| Structure | **Monorepo** — `client/` + `server/`               |

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Redux)"]
        UI[Pages & Components]
        RTK[Redux Toolkit Store]
        RQ[Redux Query / RTK Query]
        UI --> RTK
        RTK --> RQ
    end

    subgraph Server["Backend (Node + Express)"]
        Routes[REST API Routes]
        AuthMW[JWT Auth Middleware]
        Services[Business Logic]
        Routes --> AuthMW
        AuthMW --> Services
    end

    subgraph Data["Database"]
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
        Prisma --> DB
    end

    Services --> Prisma

    RQ -->|JWT in headers| Routes
```

## API Endpoints (recommended by assignment)

| Method | Endpoint             | Auth | Purpose                                                       |
| ------ | -------------------- | ---- | ------------------------------------------------------------- |
| POST   | `/login`             | No   | Authenticate user, return JWT                                 |
| GET    | `/userInfo`          | Yes  | Validate JWT, return user profile                             |
| GET    | `/getQuestions`      | Yes  | List questions (with tags, author)                            |
| POST   | `/createQuestion`    | Yes  | Create new question with tags                                 |
| GET    | `/getQuestionAnswer` | Yes  | Get single question + answers **sorted by vote score (desc)** |
| POST   | `/answer`            | Yes  | Submit answer to a question                                   |
| POST   | `/vote`              | Yes  | Upvote/downvote an answer                                     |
| GET    | `/getVotes`          | Yes  | Get vote counts for answers                                   |

## Data Model

```mermaid
erDiagram
    USER ||--o{ QUESTION : asks
    USER ||--o{ ANSWER : writes
    USER ||--o{ VOTE : casts
    QUESTION ||--o{ ANSWER : has
    ANSWER ||--o{ VOTE : receives

    USER {
        uuid id PK
        string nickname
        string fullName
        string email
        string passwordHash "SHA-512"
    }

    QUESTION {
        uuid id PK
        uuid userId FK
        string title
        string body
        string tags "text[]"
        datetime createdAt
    }

    ANSWER {
        uuid id PK
        uuid questionId FK
        uuid userId FK
        string body
        datetime createdAt
    }

    VOTE {
        uuid id PK
        uuid answerId FK
        uuid userId FK
        int value "+1 or -1"
        string unique "userId + answerId"
    }
```

### Prisma Schema Highlights

- **Vote uniqueness:** `@@unique([userId, answerId])` — one vote per user per answer; re-voting updates the existing row
- **Tags:** stored as `String[]` on the `Question` model (PostgreSQL array column)
- **Vote score:** computed at query time as `SUM(vote.value)` per answer; not stored as a denormalized column

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Enter credentials
    F->>A: POST /login {email, password}
    A->>D: Find user by email
    A->>A: Hash password SHA-512, compare
    A-->>F: JWT (1h expiry)
    F->>F: Store JWT (memory/localStorage)

    Note over F,A: All subsequent requests
    F->>A: Request + Authorization: Bearer JWT
    A->>A: Validate JWT middleware
    A-->>F: Response
```

## Frontend Pages

| Page            | Route            | Stage | Description                                              |
| --------------- | ---------------- | ----- | -------------------------------------------------------- |
| Login           | `/login`         | 1     | Email/password form                                      |
| Questions List  | `/`              | 1     | Browse all questions                                     |
| Ask Question    | _modal on `/`_   | 1     | Overlay form: title, body, tags — not a standalone route |
| Question Detail | `/questions/:id` | 1–3   | Question + answers + vote UI                             |

## Frontend Architecture

> Scope: Stage 1 (auth + questions). Answer/voting UI (Stage 2–3) plugs into the same structure without refactoring.

### Folder Structure (`client/src`)

CSS Modules are co-located with their component (`Component.tsx` + `Component.module.css`), omitted below for brevity.

```
client/src/
├── main.tsx                    # ReactDOM root, wraps <App/> in <Provider store>
├── App.tsx                     # <BrowserRouter> + <Routes>
├── app/
│   ├── store.ts                # configureStore; preloads auth state from localStorage
│   └── hooks.ts                 # typed useAppDispatch / useAppSelector
├── api/                          # RTK Query layer (the only place that calls fetch)
│   ├── baseApi.ts                # createApi base: baseUrl "/api", prepareHeaders (JWT), 401 handling
│   ├── authApi.ts                # injectEndpoints: login, userInfo
│   └── questionsApi.ts           # injectEndpoints: getQuestions, createQuestion, getQuestionAnswer
├── features/
│   └── auth/
│       └── authSlice.ts          # { token, user } + setCredentials/logout, syncs to localStorage
├── components/
│   ├── ui/                       # generic, store-agnostic primitives
│   │   ├── Button.tsx
│   │   ├── TextField.tsx
│   │   ├── TextArea.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── AppHeader.tsx         # logo, search (visual only in Stage 1), Ask question, logout
│   │   └── ProtectedRoute.tsx    # redirects to /login if not authenticated
│   ├── auth/
│   │   └── LoginForm.tsx
│   └── questions/
│       ├── QuestionList.tsx
│       ├── QuestionListItem.tsx
│       ├── TagBadge.tsx
│       ├── AskQuestionModal.tsx
│       └── AskQuestionForm.tsx
├── pages/                        # kebab-case files (route-level), one per route
│   ├── login-page.tsx
│   ├── questions-page.tsx
│   └── question-detail-page.tsx
├── types/                        # shared contracts with the backend (see below)
│   ├── user.ts
│   ├── question.ts
│   ├── answer.ts                 # defined now (backend already returns it); unused until Stage 2
│   ├── auth.ts
│   └── api.ts                    # ApiSuccess<T> / ApiError envelope
└── utils/
    └── format-date.ts            # "asked <date>" / "answered <date>" formatting
```

**Notes**

- `api/` uses RTK Query exclusively — no component calls `fetch`/`axios` directly.
- `features/auth/authSlice.ts` is the **only** slice needed for Stage 1 (no server data is duplicated in plain Redux state — RTK Query owns the questions cache).
- Naming follows `.cursorrules`: `kebab-case` for `pages/`, `PascalCase` for components in `components/`.

### TypeScript Interfaces (Backend ↔ Frontend Contract)

These mirror the exact JSON shapes returned by `server/src/routes/auth.ts` and `server/src/routes/questions.ts` today, so the two sides can't drift silently.

```typescript
// types/api.ts — matches .cursorrules response envelope
export interface ApiSuccess<T> {
  data: T;
}
export interface ApiError {
  error: string;
}

// types/user.ts
export interface User {
  id: string;
  nickname: string;
  fullName: string;
  email: string;
}

// Lightweight author shape embedded in Question/Answer (no email exposed)
export interface Author {
  id: string;
  nickname: string;
  fullName: string;
}

// types/question.ts
export interface Question {
  id: string;
  userId: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string; // ISO date string
  user: Author;
}

// types/answer.ts — Stage 2 model, typed now to match GET /getQuestionAnswer today
export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  body: string;
  createdAt: string;
  user: Author;
}

// types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponseData {
  token: string;
  user: User;
}

// Per-endpoint response payloads (wrapped in ApiSuccess<T> by the server)
export interface GetQuestionsResponse {
  questions: Question[];
}
export interface CreateQuestionResponse {
  question: Question;
}
export interface GetQuestionAnswerResponse {
  question: Question;
  answers: Answer[]; // empty array until Stage 2
}
```

RTK Query endpoints use `transformResponse: (res: ApiSuccess<T>) => res.data` so hooks (`useGetQuestionsQuery`, etc.) resolve directly to `GetQuestionsResponse`, not the envelope. Non-2xx responses (`{ error: string }`) surface as `error.data.error` on the RTK Query error object.

### Component Breakdown & State Flow

| Component                                     | Type  | Responsibility                                                                                                                              |
| --------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `App.tsx`                                     | Smart | Router only; renders `/login` and `ProtectedRoute`-wrapped app routes                                                                       |
| `ProtectedRoute`                              | Smart | Reads `state.auth.token` via `useAppSelector`; redirects to `/login` if absent                                                              |
| `AppHeader`                                   | Smart | Reads current user; dispatches `logout()`; opens Ask Question modal                                                                         |
| `login-page.tsx`                              | Smart | Calls `useLoginMutation`; on success dispatches `setCredentials`, navigates `/`                                                             |
| `LoginForm`                                   | Dumb  | Controlled email/password inputs; `onSubmit(email, password)`; shows passed-in error/loading                                                |
| `questions-page.tsx`                          | Smart | Calls `useGetQuestionsQuery` + `useCreateQuestionMutation`; owns modal open/close local state                                               |
| `QuestionList`                                | Dumb  | Maps `Question[]` → `QuestionListItem`                                                                                                      |
| `QuestionListItem`                            | Dumb  | Renders title/body excerpt/tags/author/date; `<Link>` to detail page. **No vote/answer counts in Stage 1** (not yet available from the API) |
| `TagBadge`                                    | Dumb  | Single tag pill                                                                                                                             |
| `AskQuestionModal`                            | Dumb  | Wraps `Modal` + `AskQuestionForm`; `open`/`onClose` props                                                                                   |
| `AskQuestionForm`                             | Dumb  | Title/body/tags(comma-separated) inputs; `onSubmit(payload)`                                                                                |
| `question-detail-page.tsx`                    | Smart | Calls `useGetQuestionAnswerQuery(id)` via `useParams`; renders question content + metadata only (answers UI arrives in Stage 2)             |
| `Button` / `TextField` / `TextArea` / `Modal` | Dumb  | Store-agnostic UI primitives, fully prop-driven                                                                                             |

```mermaid
flowchart TD
    Main[main.tsx: Provider + BrowserRouter] --> AppRoot[App.tsx: Routes]
    AppRoot --> LoginRoute["/login"]
    AppRoot --> Protected[ProtectedRoute]

    LoginRoute --> LoginPage[login-page.tsx]
    LoginPage --> LoginForm

    Protected --> Header[AppHeader]
    Protected --> QuestionsRoute["/"]
    Protected --> DetailRoute["/questions/:id"]

    QuestionsRoute --> QuestionsPage[questions-page.tsx]
    QuestionsPage --> QuestionList
    QuestionList --> QuestionListItem
    QuestionListItem --> TagBadge
    QuestionsPage --> AskQuestionModal
    AskQuestionModal --> AskQuestionForm

    DetailRoute --> QuestionDetailPage[question-detail-page.tsx]
```

**Token flow (login → authenticated request → expiry):**

```mermaid
sequenceDiagram
    participant U as User
    participant LF as LoginForm (dumb)
    participant LP as login-page (smart)
    participant API as authApi (RTK Query)
    participant Slice as authSlice (Redux)
    participant LS as localStorage
    participant Base as baseApi.prepareHeaders

    U->>LF: submit email/password
    LF->>LP: onSubmit(email, password)
    LP->>API: useLoginMutation().trigger
    API-->>LP: {token, user}
    LP->>Slice: dispatch(setCredentials({token, user}))
    Slice->>LS: persist {token, user} as JSON
    LP->>LP: navigate("/")

    Note over Base,Slice: Every later RTK Query call
    Base->>Slice: read state.auth.token
    Base->>Base: set header Authorization: Bearer <token>

    Note over Base,Slice: If a response is 401 (expired/invalid JWT)
    Base->>Slice: dispatch(logout())
    Slice->>LS: clear persisted auth
    Slice->>Protected: state.auth.token becomes null
    Protected->>U: redirect to /login
```

- `authSlice` initial state is built from `localStorage` synchronously in `store.ts`, so a page refresh keeps the user logged in until the JWT actually expires or a request 401s.
- No separate "rehydrate" API call is made on boot — the existing `getQuestions`/`getQuestionAnswer` calls double as the validity check, and a 401 on any of them triggers `logout()`.

## Git Flow

```mermaid
flowchart LR
    init["main: init"] --> s1["feature/stage-1-auth-questions"]
    s1 -->|"PR + CI"| m1["main: stage 1 merged"]
    m1 --> s2["feature/stage-2-answers"]
    s2 -->|"PR + CI"| m2["main: stage 2 merged"]
    m2 --> s3["feature/stage-3-voting"]
    s3 -->|"PR + CI"| m3["main: stage 3 merged"]
```

| Branch                           | Scope                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `main`                           | Stable baseline; all feature branches merge here via PR                             |
| `feature/stage-1-auth-questions` | Monorepo, Docker Postgres, Prisma + seed, Express JWT auth, React login & questions |
| `feature/stage-2-answers`        | Answer model, backend endpoints, question detail page (view/add answers)            |
| `feature/stage-3-voting`         | Vote model + unique constraint, server-side score sorting, voting arrows UI         |

**Rules:** One feature branch per stage. PR required before merge. CI must pass on every push/PR.

## CI Pipeline

`.github/workflows/ci.yml` runs on **push** and **pull_request** to `main` and `feature/*` branches.

| Job      | Steps                                                                 |
| -------- | --------------------------------------------------------------------- |
| `server` | `npm ci` → `prisma generate` → `lint` → `test` → `build` in `server/` |
| `client` | `npm ci` → `npm run lint` → `npm run build` in `client/`              |

CI validates code integrity at each stage without requiring a running database (Prisma `generate` only; no `migrate` in CI). Stage 1 API tests mock Prisma so they run offline in CI.

## Testing (Server)

| Tool         | Role                                                |
| ------------ | --------------------------------------------------- |
| Vitest       | Test runner (`npm test` in `server/`)               |
| Supertest    | HTTP assertions against Express app                 |
| Prisma mocks | `vi.mock` in `tests/setup.ts` — no live DB required |

Test files: `server/tests/auth.test.ts`, `server/tests/questions.test.ts`, `server/tests/health.test.ts`

## Pre-commit Hooks

Husky + lint-staged at the monorepo root run **before every commit**, only on staged files:

| Staged files              | Actions                             |
| ------------------------- | ----------------------------------- |
| `server/**/*.{ts,js}`     | ESLint `--fix` → Prettier `--write` |
| `client/**/*.{ts,tsx,js}` | ESLint `--fix` → Prettier `--write` |
| `**/*.{json,md,yml,yaml}` | Prettier `--write`                  |

```bash
# Root install (triggers husky via prepare script)
npm install

# Hook lives at .husky/pre-commit → npx lint-staged
```

## Local Development

| Service     | How it runs                           |
| ----------- | ------------------------------------- |
| PostgreSQL  | Docker Compose (`postgres:16-alpine`) |
| Express API | Locally — `npm run dev` in `server/`  |
| React app   | Locally — `npm run dev` in `client/`  |

```bash
docker compose up -d          # start Postgres
cd server && npx prisma migrate dev && npx prisma db seed
cd server && npm run dev      # http://localhost:3001
cd client && npm run dev      # http://localhost:5173
```

## Project Structure (Monorepo)

```
IVOverflow/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions: lint + build (client + server)
├── client/                     # React frontend (runs locally)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/              # Redux Toolkit + RTK Query
│   │   └── App.tsx
│   └── package.json
├── server/                     # Express backend (runs locally)
│   ├── prisma/
│   │   ├── schema.prisma       # PostgreSQL schema
│   │   ├── seed.ts             # Hardcoded users (SHA-512 passwords)
│   │   └── migrations/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/         # JWT auth
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
├── docker-compose.yml          # PostgreSQL only (postgres:16-alpine)
├── architecture.md
├── todo.md
├── AGENT.md
└── .cursorrules
```

## Answer Sorting & Voting Rules

### Server-side answer ordering

`GET /getQuestionAnswer` returns answers **sorted by vote score descending** (highest first). The server computes score per answer and applies `ORDER BY score DESC, createdAt ASC` as a tiebreaker.

```sql
-- Conceptual query shape
SELECT answer.*, COALESCE(SUM(vote.value), 0) AS score
FROM answers
LEFT JOIN votes ON votes.answer_id = answers.id
WHERE answers.question_id = $1
GROUP BY answers.id
ORDER BY score DESC, answers.created_at ASC
```

The frontend does **not** re-sort answers — ordering is guaranteed by the API.

### Vote constraint

- One vote per user per answer, enforced by Prisma `@@unique([userId, answerId])`
- `POST /vote` upserts: if the user already voted, update `value` (+1 or -1); otherwise insert
- Changing from upvote to downvote (or vice versa) updates the existing vote row

## Decisions Made

- [x] **Database:** PostgreSQL
- [x] **ORM:** Prisma
- [x] **Structure:** Monorepo (`client/` + `server/`)
- [x] **Git Flow:** Feature branches per stage, PR + CI before merge
- [x] **CI:** GitHub Actions — lint + build on push/PR
- [x] **Vote constraint:** `@@unique([userId, answerId])` — one vote per user per answer
- [x] **Answer ordering:** Server returns answers sorted by vote score (desc)
- [x] **JWT storage:** `localStorage` — backend returns the token in the JSON body (no `Set-Cookie`), so the client must persist it itself; `localStorage` keeps the session alive across refreshes with no refresh-token endpoint to otherwise restore it
- [x] **Frontend styling:** CSS Modules (`*.module.css`) co-located per component — zero extra dependencies, scoped class names, matches the plain wireframe aesthetic

## Open Decisions

- [ ] Code snippet rendering library (e.g., Prism, highlight.js) — deferred to Polish & Extras; Stage 1 uses a plain textarea for question body

## Security Notes

- Passwords stored as SHA-512 hashes (per assignment spec)
- JWT required on all authenticated endpoints
- JWT expiration: 1 hour
- Prisma parameterized queries prevent SQL injection
- Vote uniqueness enforced at database level (unique constraint), not only in application logic
