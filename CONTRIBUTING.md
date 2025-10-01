# Contributing to Schedura

## Development Setup

This project uses a monorepo structure with pnpm workspaces and Turbo for build orchestration.

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Getting Started

```sh
# Install dependencies
pnpm install

# Start all applications in development mode
pnpm dev

# Start specific application
pnpm --filter @schedura/web dev
pnpm --filter @schedura/mobile dev
```

## Branching Conventions

### Branch Naming

Use the following format for branch names:

- `feat/<area>/<short>` - New features (e.g., `feat/mobile/oauth`)
- `chore/<area>/<short>` - Maintenance tasks (e.g., `chore/ci/monorepo`)
- `fix/<area>/<short>` - Bug fixes (e.g., `fix/web/auth-redirect`)

### Areas

- `web` - Web application
- `mobile` - Mobile application
- `api` - API/backend changes
- `ui` - UI components
- `scheduler` - Scheduling engine
- `config` - Configuration changes
- `ci` - CI/CD changes
- `infra` - Infrastructure changes

### Examples

- `feat/mobile/oauth` - Add OAuth to mobile app
- `chore/ci/monorepo` - Set up monorepo CI
- `fix/web/auth-redirect` - Fix authentication redirect in web app

## Pull Request Guidelines

### PR Title Format

`[area] feat|chore|fix: short description`

Examples:
- `[mobile] feat: add OAuth authentication`
- `[ci] chore: add GitHub Actions workflow`
- `[web] fix: resolve auth redirect loop`

### PR Checklist

Before submitting a PR, ensure:

- [ ] Runs `pnpm install` locally without errors
- [ ] Lint passes: `pnpm lint`
- [ ] Type check passes: `pnpm typecheck`
- [ ] Unit tests pass: `pnpm test`
- [ ] If database changes: migration file included
- [ ] Code follows project conventions
- [ ] Documentation updated if needed

### Reviewers

- @Daniel & @Marcus (or actual handles)

## Project Structure

```
schedura-app/
├── apps/
│   ├── web/          # Web application (React + Vite)
│   └── mobile/       # Mobile application (Expo + React Native)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── api-sdk/      # API client SDK
│   ├── scheduler/    # Scheduling engine
│   └── config/       # Shared configurations
└── supabase/         # Database and backend functions
```

## Available Scripts

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all packages
- `pnpm test` - Run all tests
- `pnpm typecheck` - Type check all packages
- `pnpm clean` - Clean build artifacts

## Labels & Milestones

### Labels

- `area:web` - Web application changes
- `area:mobile` - Mobile application changes
- `area:api` - API/backend changes
- `infra` - Infrastructure changes
- `security` - Security-related changes
- `bug` - Bug fixes
- `enhancement` - Feature enhancements
- `good-first` - Good first issues
- `blocked` - Blocked by dependencies
- `experimental` - Experimental features
- `release` - Release-related changes

### Milestones

- `v0.1 Web Read-only` - Web in monorepo + api-sdk
- `v0.2 Mobile MVP` - Expo scaffold + calendar MVP
- `v0.3 Scheduler Beta` - List→schedule + publish
- `v1.0 Public Beta` - Team, billing, app store basics
