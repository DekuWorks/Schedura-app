# @schedura/mobile

Mobile application for Schedura built with Expo and React Native.

## Features

- Authentication with secure token storage
- Calendar integration
- Task scheduling
- Cross-platform support (iOS/Android)

## Development

### Environment Setup

The mobile app is pre-configured with environment variables from your web app:

```sh
# Environment variables are already set up
# Check current configuration
cat .env

# Re-run setup if needed
pnpm setup:env
```

### Development Commands

```sh
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android
```

## Building

```sh
# Build for development
eas build --profile development

# Build for production
eas build --profile production
```

## Architecture

- **Expo Router** - File-based routing
- **React Native** - Cross-platform UI
- **Expo Secure Store** - Secure token storage
- **Shared Packages** - UI components and business logic
