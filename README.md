# Schedura Monorepo

A unified scheduling and task management platform with web and mobile applications.

## 🏗️ Structure

```
schedura-monorepo/
├── apps/
│   ├── web/          # React + Vite web application
│   └── mobile/       # React Native + Expo mobile app
├── packages/
│   ├── ui/           # Shared UI components (React + React Native)
│   ├── api-sdk/      # Typed API client for Supabase
│   └── config/       # Shared configurations (TypeScript, ESLint, etc.)
├── supabase/         # Database, functions, and migrations
├── package.json      # Root package with workspace scripts
├── pnpm-workspace.yaml
└── turbo.json        # Turborepo configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Expo CLI (for mobile development)

### Installation
```bash
# Install dependencies
pnpm install

# Run web app
pnpm --filter @schedura/web dev

# Run mobile app
pnpm --filter @schedura/mobile start

# Build all packages
pnpm build
```

## 📱 Mobile App

The mobile app is built with React Native and Expo, featuring:
- Cross-platform compatibility (iOS/Android)
- Supabase authentication
- Task management with categories
- Calendar integration
- AI-powered scheduling suggestions

### Development
```bash
cd apps/mobile
pnpm start          # Start Expo dev server
pnpm ios            # Run on iOS simulator
pnpm android        # Run on Android emulator
```

### Building
```bash
pnpm build:ios      # Build for iOS
pnpm build:android  # Build for Android
```

## 🌐 Web App

The web application provides a full-featured scheduling interface with:
- Modern React + TypeScript
- Tailwind CSS styling
- Supabase integration
- Responsive design

### Development
```bash
cd apps/web
pnpm dev            # Start Vite dev server
pnpm build          # Build for production
pnpm preview        # Preview production build
```

## 📦 Shared Packages

### @schedura/ui
Cross-platform UI components that work on both web and mobile:
- Button, Card, CalendarTile
- Consistent styling with almond/teal theme
- React Native Web compatibility

### @schedura/api-sdk
Typed API client for Supabase integration:
- User authentication
- Task and category management
- AI functions integration
- Type-safe database operations

### @schedura/config
Shared development configurations:
- TypeScript base configuration
- ESLint rules
- Build tooling setup

## 🗄️ Database

The project uses Supabase for:
- **Authentication**: User sign-up/sign-in
- **Database**: PostgreSQL with real-time subscriptions
- **Edge Functions**: AI-powered features
- **Storage**: File uploads and assets

### Key Tables
- `users`: User profiles and preferences
- `tasks`: Task management with categories
- `categories`: User-defined task categories
- `events`: Calendar events and scheduling

## 🤖 AI Features

Powered by Supabase Edge Functions:
- **Task Suggestions**: AI-generated task recommendations
- **Smart Scheduling**: Automatic time slot optimization
- **Availability Analysis**: Calendar conflict detection
- **Image Scanning**: Extract tasks from images

## 🔧 Development

### Adding New Features
1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes in appropriate app/package
3. Test across web and mobile
4. Update shared packages if needed
5. Submit PR with proper labels

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits for changelog

## 🚀 Deployment

### Web App
- Automatic deployment to Vercel/Netlify on main branch
- Preview deployments for PRs

### Mobile App
- EAS Build for iOS/Android
- TestFlight for iOS beta testing
- Google Play Console for Android

## 📋 Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm typecheck        # Type check all packages
pnpm test             # Run all tests

# Individual apps
pnpm --filter @schedura/web dev
pnpm --filter @schedura/mobile start
pnpm --filter @schedura/ui build
```

## 🔐 Environment Variables

Create `.env` files in each app directory:

### apps/web/.env
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### apps/mobile/.env
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.