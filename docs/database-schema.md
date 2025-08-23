# Database Schema Documentation

This document outlines the PostgreSQL database schema for the University Application Tracking System.

## Architecture Design

This database uses a **no foreign key constraints** approach for maximum flexibility and easier maintenance. All relationships are maintained through logical references (ID fields) and validated at the application level.

### Benefits of No Foreign Key Architecture
- **Simplified Migrations**: No cascading dependency issues during schema changes
- **Easier Data Operations**: Bulk imports, exports, and cleanup operations are straightforward
- **Flexible Development**: Tables can be modified independently without constraint conflicts
- **Better Performance**: No foreign key validation overhead during writes
- **Microservices Ready**: Each table can potentially be moved to separate services

### Data Integrity Strategy
- **Application-level validation**: All relationships validated in business logic
- **Unique constraints**: Prevent duplicate records where needed
- **Input validation**: Comprehensive validation at API endpoints
- **Transaction management**: Use database transactions for multi-table operations

## Core Tables

### Students Table
Stores student academic profiles and educational information. Contains complete student data including authentication credentials for independent operation.

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL, -- Logical reference to users.id (no foreign key)
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    graduation_year INTEGER,
    gpa DECIMAL(3,2),
    sat_score INTEGER,
    act_score INTEGER,
    target_countries TEXT[],
    intended_majors TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Architecture Notes:**
- Maintains separate authentication data for flexibility
- `user_id` provides logical link to users table without database constraints
- Independent operation allows for easier data migration and maintenance

### Universities Table
Contains university information and application details.

```sql
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    us_news_ranking INTEGER,
    acceptance_rate DECIMAL(4,2),
    application_system VARCHAR(100), -- 'Common App', 'Coalition', 'Direct'
    tuition_in_state DECIMAL(10,2),
    tuition_out_state DECIMAL(10,2),
    application_fee DECIMAL(6,2),
    deadlines JSONB, -- {early_decision: 'date', early_action: 'date', regular_decision: 'date', rolling_admission: 'date'}
    available_majors TEXT[], -- Array of available majors
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Applications Table
Tracks student applications to universities with status workflow.

```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL, -- Logical reference to students.id
    university_id UUID NOT NULL, -- Logical reference to universities.id
    application_type VARCHAR(50) NOT NULL, -- 'Early Decision', 'Early Action', 'Regular Decision', 'Rolling Admission'
    deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'submitted', 'under_review', 'decided'
    submitted_date DATE,
    decision_date DATE,
    decision_type VARCHAR(50), -- 'accepted', 'rejected', 'waitlisted'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, university_id, application_type)
);
```

### Application Requirements Table
Tracks individual requirements for each application.

```sql
CREATE TABLE application_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL, -- Logical reference to applications.id
    requirement_type VARCHAR(100) NOT NULL, -- 'essay', 'recommendation', 'transcript'
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    deadline DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### University Requirements Table
Stores the standard application requirements for each university. This serves as a template for creating application requirements when students apply.

```sql
CREATE TABLE university_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL, -- Logical reference to universities.id
    requirement_type VARCHAR(100) NOT NULL, -- 'essay', 'recommendation', 'transcript', 'portfolio', 'interview'
    is_required BOOLEAN NOT NULL DEFAULT true, -- Whether this requirement is mandatory or optional
    description TEXT, -- Detailed description of the requirement
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(university_id, requirement_type)
);
```

### Users Table (Authentication & RBAC)
Central authentication table that manages user accounts and role-based access control. Each user account is assigned a specific role that determines their permissions and data access patterns.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'student', 'parent', 'teacher', 'admin'
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Role Relationships:**
- **Student Role**: Logically linked to `students` table via `user_id` field
- **Parent Role**: Links to students through `student_parent_relationships` table
- **Teacher/Admin Roles**: Reserved for future implementation
- **No foreign key constraints**: All relationships managed at application level

### Student Parent Relationships Table
Manages many-to-many relationships between parent users and students. This allows multiple parents to access the same student's application data, and parents to monitor multiple students.

```sql
CREATE TABLE student_parent_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL, -- Logical reference to students.id
    parent_id UUID NOT NULL, -- Logical reference to users.id
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, parent_id)
);
```

**Relationship Notes:**
- `parent_id` logically references `users.id` where `users.role = 'parent'`
- `student_id` logically references `students.id`
- Enables role-based access: parents get read-only access to linked students' data
- Supports multiple guardians per student and parents monitoring multiple children
- **No foreign key constraints**: Relationships validated at application level

### Parent Notes Table
Allows parents to add notes about their child's applications.

```sql
CREATE TABLE parent_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL, -- Logical reference to users.id
    student_id UUID NOT NULL, -- Logical reference to students.id
    application_id UUID NOT NULL, -- Logical reference to applications.id
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_deadline ON applications(deadline);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_application_requirements_application_id ON application_requirements(application_id);
CREATE INDEX idx_universities_ranking ON universities(us_news_ranking);
CREATE INDEX idx_universities_acceptance_rate ON universities(acceptance_rate);
CREATE INDEX idx_universities_country ON universities(country);
CREATE INDEX idx_universities_state ON universities(state);
CREATE INDEX idx_universities_city ON universities(city);
CREATE INDEX idx_universities_location_composite ON universities(country, state, city);
CREATE INDEX idx_universities_available_majors ON universities USING GIN(available_majors);
CREATE INDEX idx_student_parent_relationships_student_id ON student_parent_relationships(student_id);
CREATE INDEX idx_student_parent_relationships_parent_id ON student_parent_relationships(parent_id);
CREATE INDEX idx_parent_notes_student_id ON parent_notes(student_id);
CREATE INDEX idx_parent_notes_parent_id ON parent_notes(parent_id);

-- Time-based indexes for performance
CREATE INDEX idx_students_created_at ON students(created_at);
CREATE INDEX idx_students_updated_at ON students(updated_at);
CREATE INDEX idx_universities_created_at ON universities(created_at);
CREATE INDEX idx_universities_updated_at ON universities(updated_at);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_applications_updated_at ON applications(updated_at);
CREATE INDEX idx_applications_submitted_date ON applications(submitted_date);
CREATE INDEX idx_applications_decision_date ON applications(decision_date);
CREATE INDEX idx_application_requirements_created_at ON application_requirements(created_at);
CREATE INDEX idx_application_requirements_updated_at ON application_requirements(updated_at);
CREATE INDEX idx_application_requirements_deadline ON application_requirements(deadline);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_updated_at ON users(updated_at);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_parent_notes_created_at ON parent_notes(created_at);
CREATE INDEX idx_parent_notes_updated_at ON parent_notes(updated_at);
CREATE INDEX idx_university_requirements_university_id ON university_requirements(university_id);
CREATE INDEX idx_university_requirements_requirement_type ON university_requirements(requirement_type);
CREATE INDEX idx_university_requirements_is_required ON university_requirements(is_required);
CREATE INDEX idx_university_requirements_created_at ON university_requirements(created_at);
CREATE INDEX idx_university_requirements_updated_at ON university_requirements(updated_at);
```

## Business Rules

### User-Role Relationships
- **One user account per person**: Each individual has exactly one login account
- **Role-based data access**: User role determines which tables they can access
- **Student-User linking**: Each student profile links to exactly one user account
- **Parent-Student linking**: Parents can be linked to multiple students, students can have multiple parent links
- **Unique constraints**: One application per (student, university, application_type) combination

### Application Status Workflow
- `not_started` → `in_progress` → `submitted` → `under_review` → `decided`
- Once `submitted`, cannot go back to previous states
- `decision_type` can only be set when status is `decided`

### Application Types
- **Early Decision**: Binding commitment, single choice
- **Early Action**: Non-binding early application
- **Regular Decision**: Standard application timeline
- **Rolling Admission**: Applications reviewed as received

### Data Validation
- GPA: 0.00 - 4.00 scale
- SAT Score: 400 - 1600 range
- ACT Score: 1 - 36 range
- Acceptance Rate: 0.00 - 100.00 percentage
- Deadlines must be future dates for new applications

## Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐
│     users       │    │    students     │
│  ┌──────────────┤    │  ┌──────────────┤
│  │ id (PK)      │ ┄┄┄┤│  │ id (PK)      │
│  │ email        │    │  │ user_id      │─┐
│  │ role         │    │  │ name         │ │
│  │ first_name   │    │  │ email        │ │
│  │ last_name    │    │  │ gpa          │ │
│  └──────────────┤    │  └──────────────┤ │
└─────────────────┘    └─────────────────┘ │
         ▲                                 │
         ┄ (parent_id)                     │ (student_id)
         ┄                                 ▼
┌─────────────────┐              ┌─────────────────┐
│student_parent_  │              │  applications   │
│relationships    │              │  ┌──────────────┤
│  ┌──────────────┤              │  │ id (PK)      │
│  │ id (PK)      │              │  │ student_id   │
│  │ student_id   │┄┄┄┄┄┄┄┄┄┄┄┄┄┤  │ university_id│─┐
│  │ parent_id    │              │  │ status       │ │
│  └──────────────┤              │  │ deadline     │ │
└─────────────────┘              │  └──────────────┤ │
                                 └─────────────────┘ │
                                          ┄ (application_id) │ (university_id)
                                          ▼                  ▼
                                 ┌─────────────────┐ ┌─────────────────┐
                                 │application_     │ │  universities   │
                                 │requirements     │ │  ┌──────────────┤
                                 │  ┌──────────────┤ │  │ id (PK)      │
                                 │  │ id (PK)      │ │  │ name         │
                                 │  │application_id│ │  │ country      │
                                 │  │ type         │ │  │ ranking      │
                                 │  │ status       │ │  └──────────────┤
                                 │  └──────────────┤ └─────────────────┘
                                 └─────────────────┘          ┄ (university_id)
                                                              ▼
                                                     ┌─────────────────┐
                                                     │university_      │
                                                     │requirements     │
                                                     │  ┌──────────────┤
                                                     │  │ id (PK)      │
                                                     │  │university_id │
                                                     │  │ type         │
                                                     │  │ is_required  │
                                                     │  └──────────────┤
                                                     └─────────────────┘

Legend: ┄┄┄ Logical references (no foreign keys)
        ──── Direct connections
```

**Note**: All table relationships are maintained through logical ID references rather than database foreign key constraints. This provides greater flexibility while relationships are enforced in the application layer.

## Security Considerations

### Role-Based Access
- **Students**: Full CRUD on their own applications
- **Parents**: Read-only access to linked students' applications + note creation
- **Teachers**: (Future) Read access to assigned students
- **Admins**: (Future) Full system access

### Data Protection
- All passwords stored as bcrypt hashes
- JWT tokens for session management
- UUID primary keys to prevent enumeration attacks
- Application-level data integrity validation
- No foreign key constraints for simplified data management

### Access Control Examples
```sql
-- Student accessing their own data (using logical joins)
SELECT * FROM applications a 
JOIN students s ON a.student_id = s.id 
JOIN users u ON s.user_id = u.id 
WHERE u.id = :current_user_id AND u.role = 'student';

-- Parent accessing linked student's data
SELECT * FROM applications a 
JOIN students s ON a.student_id = s.id 
JOIN student_parent_relationships spr ON s.id = spr.student_id 
WHERE spr.parent_id = :current_user_id;

-- Application-level integrity checks
-- Validate student exists before creating application
SELECT COUNT(*) FROM students WHERE id = :student_id;
-- Validate university exists before creating application
SELECT COUNT(*) FROM universities WHERE id = :university_id;
```