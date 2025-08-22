# Database Schema Documentation

This document outlines the PostgreSQL database schema for the University Application Tracking System.

## Core Tables

### Students Table
Stores student profiles with academic information.

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    deadlines JSONB, -- {early_decision: 'date', regular: 'date'}
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
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
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
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    requirement_type VARCHAR(100) NOT NULL, -- 'essay', 'recommendation', 'transcript', 'test_scores'
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    deadline DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table (for RBAC)
Manages authentication and role-based access control.

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

### Student Parent Relationships Table
Links parents to students for access control.

```sql
CREATE TABLE student_parent_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, parent_id)
);
```

### Parent Notes Table
Allows parents to add notes about their child's applications.

```sql
CREATE TABLE parent_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Indexes

```sql
-- Performance indexes
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
CREATE INDEX idx_parent_notes_student_id ON parent_notes(student_id);

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
CREATE INDEX idx_parent_notes_created_at ON parent_notes(created_at);
CREATE INDEX idx_parent_notes_updated_at ON parent_notes(updated_at);
```

## Business Rules

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
- Foreign key constraints to maintain data integrity