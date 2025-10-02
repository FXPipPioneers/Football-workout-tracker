# Football Training Tracker

## Overview

A personalized football training tracker web application designed for mobile use (specifically iPhone). The app helps athletes track their solo and friend-included training schedules, log workout performance, monitor progress over time, and prepare for coach check-ins. Built as a full-stack Progressive Web App with a focus on athletic performance monitoring and left/right foot balance tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI System:**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Athletic design system inspired by Apple Fitness and Linear
- Dark mode primary with optional light mode toggle
- Custom color palette: Athletic green primary (#45B864), electric blue accents, with dark charcoal backgrounds
- Typography: Inter for body text, Manrope for metrics/numbers

**State Management:**
- React Query for API data fetching and caching (stale-time: Infinity, no automatic refetching)
- Local React state for UI interactions
- Form state managed via React Hook Form with Zod validation

**Key Features:**
- Bottom navigation for mobile-first experience
- Workout runner with step-by-step block execution
- Progress tracking with charts (Recharts library)
- Solo/Friend mode toggle for different training schedules
- Quick logging interface for exercises
- Check-in forms for coach reporting

### Backend Architecture

**Server Framework:**
- Node.js with Express for REST API
- TypeScript throughout for type safety
- Custom middleware for request logging and error handling

**API Design:**
- RESTful endpoints organized by resource (exercises, workouts, sessions, logs)
- Consistent error handling and response formats
- Session-based routing (no authentication currently implemented)

**Key Routes:**
- `/api/exercises` - Exercise library management
- `/api/workouts` - Workout templates and schedules
- `/api/workouts/today` - Current day's workout based on mode
- `/api/sessions` - Active workout session tracking
- `/api/logs` - Exercise performance logging

**Data Layer:**
- Drizzle ORM for type-safe database queries
- Neon serverless PostgreSQL adapter with WebSocket support
- Schema-first approach with Drizzle-Zod integration
- Database initialization and seeding logic for workout templates

### Database Schema

**Core Tables:**
- `users` - User accounts (basic structure, no auth implemented)
- `exercises` - Exercise library with flags for tracking capabilities (hasLeftRight, hasNearFar, hasWeight, hasDistance, hasTime, hasHeartRate)
- `workouts` - Daily workout templates (dayOfWeek, mode: solo/friend)
- `workout_blocks` - Organized sections within workouts (warm-up, drills, strength, etc.)
- `workout_block_exercises` - Exercise prescriptions with sets/reps/rest
- `workout_sessions` - Active workout tracking with start/end times
- `exercise_logs` - Performance data per exercise (supports L/R splits, Near/Far tracking, weights, distances, HR)
- `check_ins` - Coach check-in data with comprehensive metrics

**Key Design Patterns:**
- UUID primary keys generated via PostgreSQL
- Timestamps for audit trails
- JSONB fields for flexible metadata storage
- Foreign key relationships for data integrity
- Indexes planned for userId+date, sessionId, dayOfWeek queries

### Data Model Capabilities

The exercise logging system supports:
- Left/Right foot tracking for technical drills
- Near/Far target zones for shooting accuracy
- Weight/reps/sets for strength training
- Distance and time for cardio/endurance
- Heart rate monitoring for HIIT sessions
- Sprint time arrays for speed work
- RPE (Rate of Perceived Exertion) tracking
- Variant tracking (solo vs friend sessions)

### Deployment Architecture

**Hosting:**
- Render for 24/7 production deployment
- Render PostgreSQL database service
- Environment variables for DATABASE_URL configuration

**Build Process:**
- Client: Vite production build to `dist/public`
- Server: esbuild bundle to `dist/index.js` (ESM format)
- Single-server deployment serving both API and static assets

**Development Environment:**
- Hot module replacement via Vite
- Replit-specific plugins for development UX (cartographer, dev banner, runtime error overlay)
- TypeScript checking without emit
- Path aliases for clean imports (@/, @shared/, @assets/)

## External Dependencies

### Third-Party Libraries

**UI Components:**
- Radix UI - Accessible component primitives (dialogs, dropdowns, tooltips, tabs, progress, etc.)
- Lucide React - Icon system
- Recharts - Data visualization and charting
- CMDK - Command palette component
- date-fns - Date manipulation and formatting

**Development Tools:**
- Drizzle Kit - Database migrations and schema management
- TSX - TypeScript execution for development
- ESBuild - Production bundling
- PostCSS with Autoprefixer - CSS processing

**Backend Services:**
- @neondatabase/serverless - PostgreSQL client optimized for serverless
- ws - WebSocket support for Neon
- connect-pg-simple - Session store (prepared for future auth)

**Styling & Utilities:**
- Tailwind CSS - Utility-first CSS framework
- class-variance-authority - Type-safe variant styling
- clsx & tailwind-merge - Conditional class composition

### Database Service

- **Provider:** Render PostgreSQL (production) / Neon Serverless (configured)
- **Connection:** WebSocket-based for serverless compatibility
- **ORM:** Drizzle with PostgreSQL dialect
- **Migrations:** Stored in `/migrations` directory, schema defined in `shared/schema.ts`

### Planned Integrations

- PWA support with service workers and offline capabilities (IndexedDB queue)
- Background sync for offline workout logging
- iOS-specific PWA meta tags for home screen installation
- Notification system for workout reminders

### Development Services

- Replit platform plugins for enhanced development experience
- Vite dev server with HMR
- Source map support for debugging