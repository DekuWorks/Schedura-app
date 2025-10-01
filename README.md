# Schedura App

A monorepo for the Schedura scheduling application with web and mobile apps.

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

## Getting Started

This project uses pnpm workspaces and Turbo for monorepo management.

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```sh
# Install dependencies
pnpm install

# Start all applications in development mode
pnpm dev

# Start specific application
pnpm --filter @schedura/web dev
pnpm --filter @schedura/mobile dev
```

### Available Scripts

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all packages
- `pnpm test` - Run all tests
- `pnpm typecheck` - Type check all packages

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3cb02f86-70af-4016-9624-1cbc9792e5f9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
