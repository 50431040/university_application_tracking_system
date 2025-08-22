# University Application Tracking System - CLAUDE.md

This document provides Claude with essential information about the University Application Tracking System codebase for effective development assistance.

## 🎯 Project Overview

A comprehensive Next.js web application that helps high school students manage university applications, track deadlines, and monitor progress through the college admissions process. The system supports role-based access for students and parents with future extensibility for teachers and administrators.

**Key Features:**
- Multi-university application tracking across different application systems (Common App, Coalition, Direct)
- Complete application lifecycle management (not_started → in_progress → submitted → under_review → decided)
- Role-based access control with student/parent relationships
- University database with filtering and search capabilities
- Individual requirement tracking (essays, transcripts, recommendations)
- Progress visualization and deadline monitoring

## 🛠 Tech Stack & Architecture

### Core Technologies
- **Frontend**: Next.js 15.0.3 with TypeScript, React 18.3.1
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM 5.21.1
- **Authentication**: NextAuth.js 5.0.0-beta.22 with JWT tokens
- **Styling**: Tailwind CSS 3.4.13 with custom design system
- **Testing**: Jest 29.7.0 with React Testing Library
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks

### Project Structure
```
src/
├── app/                 # Next.js 13+ App Router
│   └── api/            # API route handlers
│       ├── auth/       # Authentication endpoints
│       ├── student/    # Student-specific operations  
│       └── universities/ # University search and data
├── components/         # Reusable UI components
├── lib/               # Core utilities (Prisma client, etc.)
├── types/             # TypeScript type definitions
├── utils/             # Helper functions and utilities
├── hooks/             # Custom React hooks
├── constants/         # Application constants
└── styles/            # Global CSS and Tailwind styles

prisma/
└── schema.prisma      # Database schema definition

docs/                  # Comprehensive documentation
├── database-schema.md # Complete database design
├── api-documentation.md # REST API endpoints
└── deployment-guide.md # Production deployment
```

## ⚡ Development Commands

### Essential Commands
```bash
# Development
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run typecheck        # Run TypeScript type checking
npm run format           # Format code with Prettier

# Testing
npm run test             # Run Jest test suite
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report

# Database Operations
npm run db:generate      # Generate Prisma client from schema
npm run db:push          # Push schema changes to database
npm run db:migrate       # Create and run database migrations
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:seed          # Seed database with demo data
```

### Pre-commit Hooks
The project uses Husky with lint-staged for automatic code quality:
- ESLint fixing on `.ts, .tsx` files
- Prettier formatting on all supported files
- Runs automatically on `git commit`

## 🗄 Database Architecture

### Core Models & Relationships

**User Model (Authentication & RBAC)**
```prisma
model User {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
  role         String // 'student', 'parent', 'teacher', 'admin'
  firstName    String
  lastName     String
  // Relationships
  student                        Student?
  parentRelationships            StudentParentRelationship[] @relation("ParentUser")
  parentNotes                    ParentNote[]
}
```

**Student Model (Academic Profiles)**
```prisma
model Student {
  id               String @id @default(cuid())
  userId           String @unique
  graduationYear   Int?
  gpa              Decimal? @db.Decimal(3,2)
  satScore         Int?
  actScore         Int?
  targetCountries  String[]
  intendedMajors   String[]
  // Relationships
  applications                   Application[]
  parentRelationships            StudentParentRelationship[]
}
```

**Application Workflow Model**
```prisma
model Application {
  id               String @id @default(cuid())
  studentId        String
  universityId     String
  applicationType  String // 'Early Decision', 'Early Action', 'Regular Decision', 'Rolling Admission'
  deadline         DateTime
  status           String @default("not_started") // Status workflow
  submittedDate    DateTime?
  decisionDate     DateTime?
  decisionType     String? // 'accepted', 'rejected', 'waitlisted'
  // Relationships
  requirements     ApplicationRequirement[]
}
```

### Key Business Rules
1. **Application Status Workflow**: `not_started` → `in_progress` → `submitted` → `under_review` → `decided`
2. **Unique Constraint**: One application per student/university/application_type combination
3. **Role-Based Access**: Students own their data, parents have read-only + notes access
4. **Data Validation**: GPA (0.00-4.00), SAT (400-1600), ACT (1-36)

## 🔌 API Architecture

### Authentication Flow
- NextAuth.js with JWT token strategy
- Role-based access control at API level
- Password hashing with bcrypt

### Key API Endpoints
```
/api/auth/              # Authentication (login, register, logout)
/api/student/           # Student operations (profile, applications, dashboard)
  ├── profile          # GET/PUT student academic profile
  ├── applications     # CRUD application management
  └── dashboard        # Dashboard statistics and upcoming deadlines
/api/parent/            # Parent operations (read-only access + notes)
/api/universities/      # University search, filtering, comparison
/api/applications/[id]/requirements/  # Individual requirement tracking
```

### Error Handling Pattern
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data", 
    "details": { "field": "email", "message": "Email is required" }
  }
}
```

## 🎨 Frontend Patterns

### Component Architecture
- React Server Components with Next.js App Router
- Client components for interactive features
- Custom Tailwind design system with primary/secondary color palette
- Responsive mobile-first design approach

### State Management
- React hooks for local state
- Server state via API calls
- Form handling with controlled components
- Loading and error states throughout UI

### Design System
```css
/* Custom Tailwind Theme */
colors: {
  primary: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  secondary: { 50: '#f8fafc', 500: '#64748b', 600: '#475569', 700: '#334155' }
}
fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
```

## 🔧 Development Workflow

### Environment Setup
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and auth configuration

# 3. Set up database
npm run db:generate
npm run db:push
npm run db:seed  # Load demo data

# 4. Start development
npm run dev
```

### Required Environment Variables
```env
# Database (Local PostgreSQL or Supabase)
DATABASE_URL="postgresql://username:password@localhost:5432/university_tracker"
DIRECT_URL="postgresql://username:password@localhost:5432/university_tracker"

# Authentication
NEXTAUTH_SECRET="your-super-secret-nextauth-key-here-minimum-32-characters"  
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-key-for-token-signing"

# Optional: Supabase Integration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### Code Style & Quality
- **TypeScript**: Strict mode enabled with comprehensive path mapping (@/* aliases)
- **ESLint**: Extended configuration with Next.js + TypeScript recommended rules
- **Prettier**: Consistent formatting (single quotes, 2-space tabs, 80 char width)
- **Testing**: Jest + React Testing Library setup with jsdom environment

## 📊 Demo Data & Testing

### Test Accounts
The application includes comprehensive demo data:
- **Student**: `student@demo.com` / `password123`
  - Profile: Sarah Johnson, Class of 2024, 3.8 GPA, 1450 SAT  
  - 12 university applications across different statuses
- **Parent**: `parent@demo.com` / `password123`
  - Linked to Sarah Johnson with read-only access

### Sample Data Includes
- 50+ universities with realistic ranking, acceptance rate, and tuition data
- Complete application workflows from initial interest to final decisions
- Various requirement types and application statuses
- Parent-student relationship examples

## 🚀 Deployment & Production

### Recommended Stack
- **Hosting**: Vercel (automatic deployments from main branch)
- **Database**: Supabase PostgreSQL  
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + optional Sentry integration

### Production Considerations
- Row-level security policies in Supabase
- Environment variable management in Vercel
- Database indexing for performance (see database-schema.md)
- HTTPS enforcement and secure session management

## 🔍 Key Implementation Details

### Security Features
- JWT-based authentication with secure session management
- Row-level security policies in database
- Input validation and SQL injection protection
- UUID primary keys to prevent enumeration attacks
- HTTPS enforcement and secure environment variables

### Performance Optimizations
- Database indexing on frequently queried columns (deadlines, student_id, status)
- API response patterns optimized for common queries
- Next.js image optimization and code splitting ready
- Prisma client connection optimization for serverless

### Future Extensibility
The codebase is designed for expansion:
- Teacher/counselor roles already in schema
- Multi-tenant architecture considerations
- Integration hooks for Common App/Coalition App APIs
- Document upload system foundation
- Email notification system structure

## 📚 Documentation References

For detailed information, refer to:
- `/docs/database-schema.md` - Complete database design and relationships
- `/docs/api-documentation.md` - REST API endpoints and usage examples  
- `/docs/deployment-guide.md` - Step-by-step production deployment
- `README.md` - User-facing project overview and quick start guide

## 🤖 Claude Development Guidelines

When working with this codebase:

1. **Database Changes**: Always update both Prisma schema and migration files
2. **API Development**: Follow the established error handling and authentication patterns
3. **Frontend Components**: Use the established Tailwind design system and TypeScript types
4. **Testing**: Write tests for new features using the Jest + RTL setup
5. **Security**: Maintain role-based access control and input validation
6. **Performance**: Consider database query optimization and indexing for new features

The application demonstrates solid software architecture principles with clear separation of concerns, comprehensive documentation, and production-ready configuration.