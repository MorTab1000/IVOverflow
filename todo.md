# IVOverflow — Development Todo

> Broken down from the assignment PDF (3 stages + infrastructure)  
> Mapped to Git Flow feature branches

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

> Completed on `feature/stage-1-auth-questions`

- [ ] Initialize git repo and `main` branch
- [ ] Create `feature/stage-1-auth-questions` branch
- [ ] Initialize monorepo structure (`client/` + `server/`)
- [ ] Add root `docker-compose.yml` (PostgreSQL only)
- [ ] Scaffold Express server with TypeScript
- [ ] Scaffold React app with Redux Toolkit + RTK Query
- [ ] Create Prisma schema (User, Question, Answer, Vote)
- [ ] Set up JWT auth utilities (sign, verify, 1h expiry)
- [ ] Configure CORS and environment variables
- [ ] Add `.github/workflows/ci.yml` (lint + build on push/PR)
- [x] Husky + lint-staged pre-commit hook (Prettier + ESLint on staged files)

---

## Stage 1: Login & Questions

**Branch:** `feature/stage-1-auth-questions`

### Infrastructure & DevOps

- [ ] `docker-compose.yml` — PostgreSQL only (`postgres:16-alpine`); backend and frontend run locally
- [ ] Configure Prisma `DATABASE_URL` in `server/.env` → Docker Postgres (`localhost:5432`)
- [ ] `.github/workflows/ci.yml` — trigger on push/PR to `main` and feature branches; run `npm install`, lint, and build for both `client/` and `server/`

### Backend

- [ ] `server/prisma/schema.prisma` — User, Question models (Answer/Vote stubs for later stages)
- [ ] `npx prisma migrate dev` — apply schema to Docker database
- [ ] `server/prisma/seed.ts` — seed hardcoded users (nickname, full name, email, SHA-512 hashed passwords); wire `prisma db seed`
- [ ] `POST /login` — authenticate, return JWT
- [ ] `GET /userInfo` — validate JWT, return user profile
- [ ] `POST /createQuestion` — create question with title, body, tags
- [ ] `GET /getQuestions` — list all questions (with author, tags)
- [ ] `GET /getQuestionAnswer` — get single question by ID (answers array empty until Stage 2)

### Frontend

- [ ] Login page (`/login`) with email/password form
- [ ] Auth state in Redux (JWT storage, user info)
- [ ] Protected route wrapper (redirect to login if no JWT)
- [ ] Questions list page — display all questions
- [ ] Ask Question form — title, body (with code snippet support), tags input
- [ ] Question detail page — show question content and metadata
- [ ] Submit question form → call `/createQuestion`

### Acceptance

- [ ] `docker compose up -d` starts Postgres; `prisma migrate` + `prisma db seed` succeed
- [ ] CI pipeline passes on PR
- [ ] User can log in with seeded credentials
- [ ] JWT is sent on all API requests
- [ ] User can create a question with tags
- [ ] Questions appear on list and detail pages

---

## Stage 2: Answers

**Branch:** `feature/stage-2-answers`

### Backend

- [ ] Extend Prisma schema — Answer model + relations
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

- [ ] Extend Prisma schema — Vote model with `@@unique([userId, answerId])`
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
