# IVOverflow — Development Todo

> Broken down from the assignment PDF (3 stages + infrastructure)  
> Mapped to Git Flow feature branches  
> **Keep this file updated** — mark tasks `[x]` immediately after completion.

## Git Flow Strategy

| Branch                           | Target                                                                   | Merge into |
| -------------------------------- | ------------------------------------------------------------------------ | ---------- |
| `main`                           | Stable, production-ready code                                            | —          |
| `feature/stage-1-auth-questions` | Monorepo, Docker Postgres, Prisma + seed, JWT auth, login & questions    | `main`     |
| `feature/stage-2-answers`        | Answer model, backend endpoints, question detail page (view/add answers) | `main`     |
| `feature/stage-3-voting`         | Vote model + unique constraint, server-side score sorting, voting UI     | `main`     |

**Workflow:** Branch from `main` → implement stage → open PR → CI passes → merge → delete feature branch.

---

## Phase 0: Project Setup

> On branch `feature/stage-1-auth-questions`

- [x] Initialize git repo and `main` branch
- [x] Create `feature/stage-1-auth-questions` branch
- [x] Initialize monorepo structure (`client/` + `server/`)
- [x] Add root `docker-compose.yml` (PostgreSQL only)
- [x] Scaffold Express server with TypeScript
- [ ] Scaffold React app with Redux Toolkit + RTK Query
- [x] Create Prisma schema (User, Question, Answer, Vote)
- [x] Set up JWT auth utilities (sign, verify, 1h expiry)
- [x] Configure CORS and environment variables
- [x] Add `.github/workflows/ci.yml` (lint + build on push/PR)
- [x] Husky + lint-staged pre-commit hook (Prettier + ESLint on staged files)
- [x] ESLint deps in `server/` and `client/` for CI (per-package install)
- [x] `server/tsconfig.eslint.json` — ESLint coverage for `prisma/seed.ts`

---

## Stage 1: Login & Questions

**Branch:** `feature/stage-1-auth-questions`

### Infrastructure & DevOps

- [x] `docker-compose.yml` — PostgreSQL only (`postgres:16-alpine`); backend and frontend run locally
- [x] Configure Prisma `DATABASE_URL` in `server/.env` → Docker Postgres (`localhost:5432`)
- [x] `.github/workflows/ci.yml` — trigger on push/PR to `main` and feature branches; run `npm install`, lint, and build for both `client/` and `server/`

### Backend

- [x] `server/prisma/schema.prisma` — User, Question, Answer, Vote models
- [x] `npx prisma migrate dev` — apply schema to Docker database
- [x] `server/prisma/seed.ts` — seed hardcoded users (nickname, full name, email, SHA-512 hashed passwords); wire `prisma db seed`
- [x] `server/src/utils/password.ts` — shared SHA-512 hash/verify (used by seed + login)
- [x] `server/src/middleware/auth.ts` — JWT Bearer auth middleware
- [x] `POST /login` — authenticate, return JWT
- [x] `GET /userInfo` — validate JWT, return user profile
- [x] `POST /createQuestion` — create question with title, body, tags
- [x] `GET /getQuestions` — list all questions (with author, tags)
- [x] `GET /getQuestionAnswer` — get single question by ID (answers array empty until Stage 2)
- [x] Stage 1 API tests — Vitest + Supertest (`server/tests/`) with mocked Prisma; wired into CI (`npm test`)

### Frontend

- [x] TypeScript type contracts (`types/user.ts`, `question.ts`, `answer.ts`, `auth.ts`, `api.ts`) matching backend response shapes
- [x] Redux store setup (`app/store.ts`, `app/hooks.ts`)
- [x] RTK Query API layer (`api/baseApi.ts` with JWT header injection + 401 → logout, `authApi.ts`, `questionsApi.ts`)
- [x] Reusable UI primitives (`components/ui/Button`, `TextField`, `TextArea`) with CSS Modules
- [x] Login page (`/login`) with email/password form
- [x] Auth state in Redux (JWT storage, user info) — `features/auth/authSlice.ts`, persisted to `localStorage`
- [x] Protected route wrapper (redirect to login if no JWT) — `components/layout/ProtectedRoute.tsx`
- [x] App header layout (`components/layout/AppHeader.tsx`) with logout wired; search + Ask question are Stage 1 placeholders
- [x] `App.tsx` / `main.tsx` routing + Redux `<Provider>` wired
- [x] Questions list page — display all questions (`questions-page.tsx`, `QuestionList`, `QuestionListItem`, `TagBadge`)
- [x] Ask Question form — title, body, tags input (`AskQuestionForm`, `AskQuestionModal`, `ui/Modal`); code snippet support deferred to Polish & Extras
- [x] "Ask question" trigger in `AppHeader` wired to the modal via `ProtectedRoute`'s `Outlet` context
- [x] Submit question form → calls `/createQuestion` (`useCreateQuestionMutation`), list auto-refetches via RTK Query tag invalidation
- [ ] Question detail page — show question content and metadata (**current**)

### Acceptance

- [x] `docker compose up -d` starts Postgres; `prisma migrate` + `prisma db seed` succeed
- [ ] CI pipeline passes on PR
- [x] User can log in with seeded credentials (API verified)
- [ ] JWT is sent on all API requests (backend ready; pending frontend)
- [x] User can create a question with tags (API verified)
- [ ] Questions appear on list and detail pages (pending frontend)

---

## Stage 2: Answers

**Branch:** `feature/stage-2-answers`

### Backend

- [x] Extend Prisma schema — Answer model + relations (schema exists; endpoint pending)
- [ ] `POST /answer` — submit answer to a question (questionId, body)
- [ ] Update `GET /getQuestionAnswer` — include answers (unordered until Stage 3)

### Frontend

- [ ] Answer form on question detail page
- [ ] Display answers below the question
- [ ] Submit answer → call `/answer`
- [ ] Show answer author and timestamp

### Acceptance

- [ ] CI pipeline passes on PR
- [ ] Logged-in user can submit an answer on a question page
- [ ] Answers persist and display on reload

---

## Stage 3: Voting

**Branch:** `feature/stage-3-voting`

### Backend

- [x] Extend Prisma schema — Vote model with `@@unique([userId, answerId])` (schema exists; endpoints pending)
- [ ] `POST /vote` — upvote (+1) or downvote (-1); upsert on re-vote
- [ ] `GET /getVotes` — get vote counts per answer
- [ ] Update `GET /getQuestionAnswer` — return answers sorted by vote score (desc), `createdAt` tiebreaker

### Frontend

- [ ] Up/down arrow buttons on each answer
- [ ] Display net vote score per answer
- [ ] Render answers in server-provided order (no client-side re-sort)
- [ ] Visual feedback on user's current vote

### Acceptance

- [ ] CI pipeline passes on PR
- [ ] User can upvote and downvote answers
- [ ] Vote counts update correctly
- [ ] Highest-voted answer appears at the top (server-sorted)

---

## Polish & Extras (optional)

- [ ] Code syntax highlighting in questions/answers
- [ ] Tag filtering on questions list
- [ ] Loading and error states in UI
- [ ] Basic responsive layout
- [ ] README with setup and run instructions
