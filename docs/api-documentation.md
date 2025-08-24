# API Documentation

This document describes the REST API endpoints for the University Application Tracking System built with Next.js API routes.

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

**Note:** The authentication token is also automatically stored as an HTTP-only cookie named `auth-token` upon successful login.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-app.vercel.app/api`

## Response Format

All API responses follow this standardized format:

**Success Response:**
```json
{
  "data": {
    // Response data here
  },
  "success": true
}
```

**Paginated Response:**
```json
{
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "success": true
}
```

**Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  },
  "success": false
}
```

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
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "success": true
}
```

**Note:** The token is also set as an HTTP-only cookie named `auth-token`.

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

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe"
    },
    "message": "User registered successfully"
  },
  "success": true
}
```

#### POST /api/auth/logout
Invalidate current session by clearing the authentication cookie.

**Response:**
```json
{
  "data": {
    "message": "Logged out successfully"
  },
  "success": true
}
```

### Student Endpoints

#### GET /api/student/profile
Get current student's profile information.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "graduationYear": 2024,
    "gpa": 3.75,
    "satScore": 1450,
    "actScore": 32,
    "targetCountries": ["US", "Canada"],
    "intendedMajors": ["Computer Science", "Mathematics"]
  },
  "success": true
}
```

#### PUT /api/student/profile
Update student profile information.

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

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "graduationYear": 2024,
    "gpa": 3.75,
    "satScore": 1450,
    "actScore": 32,
    "targetCountries": ["US", "Canada"],
    "intendedMajors": ["Computer Science", "Mathematics"]
  },
  "success": true
}
```

#### GET /api/student/applications
Get all applications for current student with filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by application status (not_started, in_progress, submitted, under_review, decided)
- `applicationType` (optional): Filter by application type (Early Decision, Early Action, Regular Decision, Rolling Admission)
- `deadlineRange` (optional): Filter by deadline range (all, this_week, this_month, overdue)
- `decisionType` (optional): Filter by decision type (accepted, rejected, waitlisted, deferred)
- `search` (optional): Search by university name or notes
- `sortBy` (optional): Sort by field (deadline, universityName, status, createdAt) - default: deadline
- `sortOrder` (optional): Sort order (asc, desc) - default: asc
- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page - default: 20

**Response:**
```json
{
  "data": {
    "applications": [
      {
        "id": "uuid",
        "universityId": "uuid",
        "applicationType": "Regular Decision",
        "deadline": "2024-01-01T00:00:00.000Z",
        "status": "in_progress",
        "submittedDate": null,
        "decisionDate": null,
        "decisionType": null,
        "notes": "Remember to submit essay early",
        "university": {
          "id": "uuid",
          "name": "Stanford University",
          "country": "US",
          "state": "California",
          "city": "Stanford",
          "usNewsRanking": 5,
          "acceptanceRate": 4.3,
          "applicationFee": 90
        },
        "requirements": [
          {
            "id": "uuid",
            "requirementType": "essay",
            "status": "completed"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  },
  "success": true
}
```

#### GET /api/student/dashboard
Get comprehensive dashboard data for the current student.

**Response:**
```json
{
  "data": {
    "stats": {
      "totalApplications": 12,
      "submitted": 8,
      "inProgress": 3,
      "decisions": 5,
      "acceptances": 2,
      "rejections": 2,
      "waitlisted": 1
    },
    "upcomingDeadlines": [
      {
        "applicationId": "uuid",
        "universityName": "MIT",
        "applicationType": "Regular Decision",
        "deadline": "2024-01-01T00:00:00.000Z",
        "daysRemaining": 5
      }
    ],
    "recentApplications": [
      {
        "id": "uuid",
        "universityName": "Harvard University",
        "status": "submitted",
        "submittedDate": "2023-12-15T00:00:00.000Z"
      }
    ],
    "progressOverview": {
      "totalRequirements": 45,
      "completedRequirements": 32,
      "progressPercentage": 71.1
    }
  },
  "success": true
}
```

### Application Management

#### POST /api/applications
Create a new application for the current student.

**Request Body:**
```json
{
  "universityId": "uuid",
  "applicationType": "Regular Decision"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "universityId": "uuid",
    "applicationType": "Regular Decision",
    "deadline": "2024-01-01T00:00:00.000Z",
    "status": "not_started",
    "submittedDate": null,
    "decisionDate": null,
    "decisionType": null,
    "notes": null,
    "createdAt": "2023-11-01T00:00:00.000Z",
    "updatedAt": "2023-11-01T00:00:00.000Z"
  },
  "success": true
}
```

**Note:** The deadline is automatically set based on the university's deadline data for the specified application type. If the university doesn't have deadline data for the application type, a 400 error will be returned.

#### GET /api/applications/[id]
Get detailed information about a specific application.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "universityId": "uuid",
    "applicationType": "Regular Decision",
    "deadline": "2024-01-01T00:00:00.000Z",
    "status": "in_progress",
    "submittedDate": null,
    "decisionDate": null,
    "decisionType": null,
    "notes": "Personal statement in progress",
    "university": {
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
      },
      "availableMajors": ["Computer Science", "Engineering"]
    },
    "requirements": [
      {
        "id": "uuid",
        "requirementType": "essay",
        "status": "completed",
        "deadline": "2024-01-01T00:00:00.000Z",
        "notes": "Personal statement completed"
      }
    ]
  },
  "success": true
}
```

#### PUT /api/applications/[id]
Update an application's information.

**Request Body:**
```json
{
  "status": "submitted",
  "submittedDate": "2023-12-15T00:00:00.000Z",
  "notes": "Application submitted successfully"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "submitted",
    "submittedDate": "2023-12-15T00:00:00.000Z",
    "notes": "Application submitted successfully",
    "updatedAt": "2023-12-15T00:00:00.000Z"
  },
  "success": true
}
```

#### DELETE /api/applications/[id]
Delete an application.

**Response:**
```json
{
  "data": {
    "message": "Application deleted successfully"
  },
  "success": true
}
```

### Parent Endpoints

#### GET /api/parent/students
Get all students linked to current parent.

**Response:**
```json
{
  "data": {
    "students": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "graduationYear": 2024,
        "gpa": 3.75,
        "satScore": 1450,
        "actScore": 32
      }
    ]
  },
  "success": true
}
```

#### GET /api/parent/dashboard
Get comprehensive dashboard data for a specific student from parent's perspective.

**Query Parameters:**
- `studentId` (required): ID of the student to view dashboard for

**Response:**
```json
{
  "data": {
    "student": {
      "id": "uuid",
      "name": "John Doe",
      "graduationYear": 2024,
      "gpa": 3.75,
      "satScore": 1450,
      "actScore": 32,
      "intendedMajors": ["Computer Science", "Mathematics"]
    },
    "stats": {
      "totalApplications": 12,
      "submitted": 8,
      "inProgress": 3,
      "decisions": 5,
      "acceptances": 2,
      "rejections": 2,
      "waitlisted": 1
    },
    "financialEstimates": {
      "totalApplicationFees": 1080,
      "estimatedTuitionRange": {
        "min": 35000,
        "max": 65000
      }
    },
    "upcomingDeadlines": [
      {
        "id": "uuid",
        "universityName": "MIT",
        "applicationType": "Regular Decision",
        "deadline": "2024-01-01T00:00:00.000Z",
        "status": "in_progress",
        "daysUntilDeadline": 5
      }
    ],
    "recentActivity": [
      {
        "id": "uuid",
        "universityName": "Harvard University",
        "applicationType": "Regular Decision",
        "status": "submitted",
        "updatedAt": "2023-12-15T00:00:00.000Z",
        "action": "submitted"
      }
    ],
    "parentNotes": [
      {
        "id": "uuid",
        "applicationId": "uuid",
        "note": "Remember to follow up on recommendation letters",
        "createdAt": "2023-12-01T10:00:00Z"
      }
    ],
    "applicationsOverview": [
      {
        "id": "uuid",
        "universityName": "Stanford University",
        "applicationType": "Regular Decision",
        "status": "in_progress",
        "deadline": "2024-01-01T00:00:00.000Z",
        "decisionType": null,
        "submittedDate": null
      }
    ]
  },
  "success": true
}
```

#### GET /api/parent/applications/[id]
Get detailed information about a specific application (read-only for parents).

**Response:** Same format as `/api/applications/[id]` but read-only.

### University Endpoints

#### GET /api/universities/search
Search and filter universities with advanced filtering options.

**Query Parameters:**
- `query` (optional): Search by university name
- `country` (optional): Filter by country
- `state` (optional): Filter by state
- `applicationSystem` (optional): Filter by application system ('Common App', 'Coalition', 'Direct')
- `minRanking` (optional): Minimum US News ranking
- `maxRanking` (optional): Maximum US News ranking
- `minAcceptanceRate` (optional): Minimum acceptance rate (0-100)
- `maxAcceptanceRate` (optional): Maximum acceptance rate (0-100)
- `maxTuition` (optional): Maximum tuition cost (uses out-of-state tuition)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
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
      },
      "availableMajors": ["Computer Science", "Engineering", "Business"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "success": true
}
```

#### GET /api/universities/[id]
Get detailed information about a specific university.

**Response:**
```json
{
  "data": {
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
    },
    "availableMajors": ["Computer Science", "Engineering", "Business", "Mathematics"]
  },
  "success": true
}
```

#### GET /api/universities/[id]/requirements
Get standard requirements for a specific university.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "universityId": "uuid",
      "requirementType": "essay",
      "description": "Personal statement (650 words maximum)",
      "isRequired": true,
      "deadline": null
    },
    {
      "id": "uuid",
      "universityId": "uuid",
      "requirementType": "letters_of_recommendation",
      "description": "Two letters of recommendation from teachers",
      "isRequired": true,
      "deadline": null
    }
  ],
  "success": true
}
```

### Application Requirements Endpoints

#### GET /api/applications/[id]/requirements
Get all requirements for a specific application.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "applicationId": "uuid",
      "requirementType": "essay",
      "status": "completed",
      "deadline": "2024-01-01T00:00:00.000Z",
      "notes": "Personal statement completed and reviewed",
      "createdAt": "2023-11-01T00:00:00.000Z",
      "updatedAt": "2023-12-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "applicationId": "uuid",
      "requirementType": "letters_of_recommendation",
      "status": "in_progress",
      "deadline": "2024-01-01T00:00:00.000Z",
      "notes": "Waiting for teacher responses",
      "createdAt": "2023-11-01T00:00:00.000Z",
      "updatedAt": "2023-11-15T00:00:00.000Z"
    }
  ],
  "success": true
}
```

#### POST /api/applications/[id]/requirements
Add a new requirement to an application.

**Request Body:**
```json
{
  "requirementType": "essay",
  "status": "not_started",
  "deadline": "2024-01-01T00:00:00.000Z",
  "notes": "Personal statement, 650 words max"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "applicationId": "uuid",
    "requirementType": "essay",
    "status": "not_started",
    "deadline": "2024-01-01T00:00:00.000Z",
    "notes": "Personal statement, 650 words max",
    "createdAt": "2023-11-01T00:00:00.000Z",
    "updatedAt": "2023-11-01T00:00:00.000Z"
  },
  "success": true
}
```

#### PUT /api/applications/[id]/requirements/[requirementId]
Update a specific requirement's status and information.

**Request Body:**
```json
{
  "status": "completed",
  "deadline": "2024-01-01T00:00:00.000Z",
  "notes": "Essay completed and reviewed by counselor"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "applicationId": "uuid",
    "requirementType": "essay",
    "status": "completed",
    "deadline": "2024-01-01T00:00:00.000Z",
    "notes": "Essay completed and reviewed by counselor",
    "createdAt": "2023-11-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z"
  },
  "success": true
}
```

**Note:** Updating a requirement status may automatically update the parent application's status (e.g., from "not_started" to "in_progress" when the first requirement is marked as completed).

#### DELETE /api/applications/[id]/requirements/[requirementId]
Delete a specific requirement from an application.

**Response:**
```json
{
  "data": {
    "message": "Requirement deleted successfully"
  },
  "success": true
}
```

## Error Handling

All endpoints return errors in the following standardized format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  },
  "success": false
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized (Authentication required)
- `403`: Forbidden (Insufficient permissions)
- `404`: Not Found
- `409`: Conflict (Resource already exists)
- `405`: Method Not Allowed
- `500`: Internal Server Error

### Error Types
- `AUTHENTICATION_ERROR`: Invalid credentials or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions for the requested action
- `VALIDATION_ERROR`: Invalid input data or constraint violations
- `NOT_FOUND_ERROR`: Requested resource does not exist
- `CONFLICT_ERROR`: Resource already exists or operation conflicts with current state

## Data Validation & Constraints

### Application Status Workflow
Applications follow this status progression:
1. `not_started` - Application created but no requirements started
2. `in_progress` - At least one requirement has been worked on
3. `submitted` - Application submitted to university
4. `under_review` - University is reviewing the application
5. `decided` - University has made a decision

### Requirement Status Values
- `not_started` - Requirement not yet begun
- `in_progress` - Requirement is being worked on
- `completed` - Requirement is finished

### Application Types
- `Early Decision` - Binding early application
- `Early Action` - Non-binding early application
- `Regular Decision` - Standard application deadline
- `Rolling Admission` - Applications reviewed as received

### Decision Types
- `accepted` - Student accepted to university
- `rejected` - Student rejected by university
- `waitlisted` - Student placed on waiting list
- `deferred` - Early application deferred to regular decision

### Field Constraints
- **Email**: Valid email format required
- **Password**: Minimum 8 characters
- **GPA**: 0.00 - 4.00 (decimal format)
- **SAT Score**: 400 - 1600
- **ACT Score**: 1 - 36
- **University ID**: Valid UUID format
- **Dates**: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)

### Required Fields by Endpoint
- **User Registration**: `email`, `password`, `firstName`, `lastName`, `role`
- **Application Creation**: `universityId`, `applicationType`
- **Requirement Creation**: `requirementType`
- **Profile Updates**: At least one field must be provided

## Authentication & Authorization

### Role-Based Access Control
- **Students**: Can manage their own applications, requirements, and profile
- **Parents**: Read-only access to linked students' data and can add notes
- **Admin**: (Future implementation) Full system access

### Token Expiration
- JWT tokens expire after 30 days
- Tokens are automatically refreshed on each request
- Logout clears the authentication cookie