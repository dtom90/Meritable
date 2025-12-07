# Meritable - Codebase Structure and Rules

## Project Overview
Meritable is a React Native habit tracking application built with Expo, using TypeScript and file-based routing with Expo Router. The app supports iOS, Android, and Web platforms.

## Tech Stack
- **Framework**: Expo ~54.0.27 with React Native 0.81.5
- **Routing**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Backend**: Supabase for authentication and cloud data storage
- **Local Storage**: Dexie (IndexedDB wrapper) and AsyncStorage
- **Testing**: Jest with React Native Testing Library
- **Build**: EAS Build for iOS/Android

## Directory Structure

### `/app` - Expo Router Pages
File-based routing directory. All routes are defined here:
- `_layout.tsx` - Root layout with providers (QueryClient, AuthContext, DataSourceProvider)
- `(tabs)/` - Tab navigation group
  - `_layout.tsx` - Tab layout configuration
  - `index.tsx` - Home/main tab
  - `data.tsx` - Data view tab
  - `habits/` - Habits feature routes
    - `_layout.tsx` - Habits layout
    - `index.tsx` - Habits list view
    - `[habitId].tsx` - Dynamic habit detail route
- `auth/` - Authentication routes
- `+not-found.tsx` - 404 page
- `global.css` - Global styles (NativeWind)

### `/components` - Reusable UI Components
React components organized by feature/functionality:
- **Habit-related**: `HabitItem.tsx`, `HabitInputForm.tsx`, `HabitInputModal.tsx`, `HabitTitle.tsx`, `HabitActions.tsx`, `HabitCompletionButton.tsx`, `HabitCompletions.tsx`, `HabitCompletionsCalendar.tsx`, `HabitReorderList.tsx`
- **Layout**: `HabitsListMobile.tsx`, `HabitsListWeb.tsx`, `NarrowView.tsx`, `WeekHeader.tsx`, `CustomDayHeader.tsx`
- **UI**: `ThemedText.tsx`, `ThemedView.tsx`, `AddHabitButton.tsx`, `LoginOverlay.tsx`, `ExternalLink.tsx`
- **Tests**: `__tests__/` directory for component tests

### `/db` - Data Layer
Database abstraction and data management:
- `habitDatabase.ts` - Core database interface (`HabitDatabaseInterface` abstract class)
  - Defines `Habit` and `HabitCompletion` interfaces
  - Abstract methods for CRUD operations
- `dexieDb.ts` - Dexie (IndexedDB) implementation
- `asyncStorageDb.ts` - AsyncStorage implementation
- `supabaseDb.ts` - Supabase cloud implementation
- `supabaseClient.ts` - Supabase client configuration
- `useHabitDb.ts` - React hook for database access
- `AuthContext.tsx` - Authentication context provider
- `DataSourceContext.tsx` - Data source selection context (local vs cloud)
- **Tests**: `__tests__/` for database and context tests
- **Mocks**: `__mocks__/` for testing

### `/lib` - Utility Functions
Shared utilities and helpers:
- `Colors.ts` - Color constants/theming
- `dateUtils.ts` - Date manipulation utilities
- `useWindowWidth.ts` - Responsive width hook

### `/assets` - Static Assets
- `fonts/` - Custom fonts (SpaceMono)
- `images/` - App icons, splash screens, logos

### `/ios` - iOS Native Code
Xcode project files and native iOS configuration

## Code Conventions

### TypeScript
- Strict mode enabled
- Path aliases: `@/*` maps to root directory
- Interfaces for data models: `Habit`, `HabitCompletion`
- Abstract classes for database abstraction
- Type utilities: `HabitInput`, `HabitCompletionInput` (omit auto-generated fields)

### Component Patterns
- Functional components with hooks
- Context providers for global state (Auth, DataSource)
- Custom hooks for database access (`useHabitDb`)
- Platform-specific components when needed (Mobile vs Web)

### Styling
- NativeWind (Tailwind CSS) for styling
- Global styles in `app/global.css`
- Color constants in `lib/Colors.ts`
- Responsive design with `useWindowWidth` hook

### Data Management
- Database abstraction pattern: `HabitDatabaseInterface` abstract class
- Multiple implementations: Dexie (local), AsyncStorage (local), Supabase (cloud)
- React Query for server state management
- Context API for data source selection and authentication

### Testing
- Jest with `jest-expo` preset
- React Native Testing Library for component tests
- Mock implementations in `__mocks__/`
- Test files co-located with `__tests__/` directories

## Key Patterns

### Routing
- File-based routing with Expo Router
- Grouped routes with `(tabs)` syntax
- Dynamic routes with `[habitId].tsx`
- Layout files (`_layout.tsx`) for nested layouts

### Database Abstraction
- Interface-based design allows switching between local and cloud storage
- `DataSourceContext` manages which database implementation to use
- All database operations go through the abstract interface

### Authentication
- Supabase authentication
- `AuthContext` provides auth state throughout the app
- Login overlay component for auth flows

## Development Guidelines

1. **New Features**: Add routes in `/app`, components in `/components`, utilities in `/lib`
2. **Database Changes**: Update `HabitDatabaseInterface` and all implementations (dexieDb, asyncStorageDb, supabaseDb)
3. **Styling**: Use NativeWind classes, reference `lib/Colors.ts` for theme colors
4. **Testing**: Write tests in `__tests__/` directories, use mocks from `__mocks__/`
5. **Type Safety**: Define interfaces for all data models, use TypeScript strictly
6. **Platform Support**: Consider iOS, Android, and Web when adding features

## Build & Deployment
- iOS: EAS Build with profiles (development, production, simulator)
- Web: `expo export --platform web`
- Configuration: `eas.json` for build profiles, `app.json` for Expo config

## Important Notes
- New architecture enabled (`newArchEnabled: true`)
- Typed routes enabled in Expo Router
- Dark mode UI (`userInterfaceStyle: "dark"`)
- React Query for all async data fetching
- Support for drag-and-drop reordering (`@dnd-kit`)

