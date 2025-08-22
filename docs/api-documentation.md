# API Documentation

This document describes the REST API endpoints for the University Application Tracking System built with Next.js API routes.

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-app.vercel.app/api`

## Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

#### POST /api/auth/logout
Invalidate current session (if using refresh tokens).

### Student Endpoints

#### GET /api/student/profile
Get current student's profile.

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "graduationYear": 2024,
  "gpa": 3.75,
  "satScore": 1450,
  "actScore": 32,
  "targetCountries": ["US", "Canada"],
  "intendedMajors": ["Computer Science", "Mathematics"]
}
```

#### PUT /api/student/profile
Update student profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "graduationYear": 2024,
  "gpa": 3.75,
  "satScore": 1450,
  "actScore": 32,
  "targetCountries": ["US", "Canada"],
  "intendedMajors": ["Computer Science", "Mathematics"]
}
```

#### GET /api/student/applications
Get all applications for current student.

**Query Parameters:**
- `status` (optional): Filter by application status
- `deadline` (optional): Filter by upcoming deadlines

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "university": {
        "id": "uuid",
        "name": "Stanford University",
        "ranking": 5,
        "acceptanceRate": 4.3
      },
      "applicationType": "Regular Decision",
      "deadline": "2024-01-01",
      "status": "in_progress",
      "submittedDate": null,
      "decisionDate": null,
      "decisionType": null,
      "requirements": [
        {
          "id": "uuid",
          "type": "essay",
          "status": "completed",
          "deadline": "2024-01-01"
        }
      ]
    }
  ]
}
```

#### POST /api/student/applications
Create a new application.

**Request Body:**
```json
{
  "universityId": "uuid",
  "applicationType": "Regular Decision"
}
```

**Note:** The deadline is automatically set based on the university's deadline data for the specified application type. If the university doesn't have deadline data for the application type, a 400 error will be returned.

#### PUT /api/student/applications/[id]
Update an application.

**Request Body:**
```json
{
  "status": "submitted",
  "submittedDate": "2023-12-15",
  "notes": "Application submitted successfully"
}
```

#### DELETE /api/student/applications/[id]
Delete an application.

#### GET /api/student/dashboard
Get dashboard data for student.

**Response:**
```json
{
  "stats": {
    "totalApplications": 12,
    "submitted": 8,
    "inProgress": 3,
    "decisions": 5,
    "accepted": 2,
    "waitlisted": 1,
    "rejected": 2
  },
  "upcomingDeadlines": [
    {
      "applicationId": "uuid",
      "universityName": "MIT",
      "deadline": "2024-01-01",
      "daysRemaining": 5
    }
  ],
  "recentActivity": [
    {
      "type": "application_submitted",
      "universityName": "Harvard",
      "date": "2023-12-15"
    }
  ]
}
```

### Parent Endpoints

#### GET /api/parent/students
Get all students linked to current parent.

**Response:**
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "graduationYear": 2024
    }
  ]
}
```

#### GET /api/parent/student/[studentId]/applications
Get applications for a specific student (read-only).

**Response:** Same as `/api/student/applications` but read-only.

#### POST /api/parent/student/[studentId]/notes
Add a note about student's application.

**Request Body:**
```json
{
  "applicationId": "uuid",
  "note": "Remember to follow up on recommendation letters"
}
```

#### GET /api/parent/student/[studentId]/notes
Get all notes for a student.

**Response:**
```json
{
  "notes": [
    {
      "id": "uuid",
      "applicationId": "uuid",
      "note": "Remember to follow up on recommendation letters",
      "createdAt": "2023-12-01T10:00:00Z"
    }
  ]
}
```

### University Endpoints

#### GET /api/universities
Search and filter universities.

**Query Parameters:**
- `search` (optional): Search by university name
- `country` (optional): Filter by country
- `state` (optional): Filter by state
- `city` (optional): Filter by city
- `majors` (optional): Comma-separated list of majors to filter by
- `ranking_min` (optional): Minimum US News ranking
- `ranking_max` (optional): Maximum US News ranking
- `acceptance_rate_min` (optional): Minimum acceptance rate (0-100)
- `acceptance_rate_max` (optional): Maximum acceptance rate (0-100)
- `tuition_min` (optional): Minimum tuition cost
- `tuition_max` (optional): Maximum tuition cost
- `application_system` (optional): Filter by application system ('Common App', 'Coalition', 'Direct')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "universities": [
    {
      "id": "uuid",
      "name": "Stanford University",
      "country": "US",
      "state": "California",
      "city": "Stanford",
      "usNewsRanking": 5,
      "acceptanceRate": 4.3,
      "applicationSystem": "Common App",
      "tuitionInState": 56169,
      "tuitionOutState": 56169,
      "applicationFee": 90,
      "deadlines": {
        "early_decision": "2023-11-01",
        "regular": "2024-01-01"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### GET /api/universities/[id]
Get detailed information about a specific university.

#### GET /api/universities/compare
Compare multiple universities.

**Query Parameters:**
- `ids`: Comma-separated university IDs

**Response:**
```json
{
  "comparison": [
    {
      "id": "uuid",
      "name": "Stanford University",
      "ranking": 5,
      "acceptanceRate": 4.3,
      "tuition": 56169,
      "applicationFee": 90
    }
  ]
}
```

### Application Requirements Endpoints

#### GET /api/applications/[id]/requirements
Get requirements for a specific application.

#### POST /api/applications/[id]/requirements
Add a requirement to an application.

**Request Body:**
```json
{
  "requirementType": "essay",
  "deadline": "2024-01-01",
  "notes": "Personal statement, 650 words max"
}
```

#### PUT /api/applications/[id]/requirements/[requirementId]
Update a requirement status.

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Essay completed and reviewed"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting

API requests are limited to:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute per user

## Data Validation

### Application Status Workflow
Applications follow this status progression:
1. `not_started`
2. `in_progress`
3. `submitted`
4. `under_review`
5. `decided`

### Required Fields
- Student registration: `email`, `password`, `firstName`, `lastName`
- Application creation: `universityId`, `applicationType`, `deadline`
- Requirement creation: `requirementType`, `deadline`

### Field Constraints
- GPA: 0.00 - 4.00
- SAT Score: 400 - 1600
- ACT Score: 1 - 36
- Email: Valid email format
- Passwords: Minimum 8 characters