# Deployment Guide

This guide covers deploying the University Application Tracking System to production using Vercel and Supabase.

## Prerequisites

- Node.js 18+ installed
- Git repository on GitHub
- Vercel account
- Supabase account

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization and enter project details:
   - **Name**: `university-tracker`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"

### 2. Configure Database

1. Wait for project initialization (2-3 minutes)
2. Go to **SQL Editor** in the Supabase dashboard
3. Run the database schema from `docs/database-schema.md`:

```sql
-- Copy and paste the CREATE TABLE statements from database-schema.md
-- Run them in order: users, students, universities, applications, etc.
```
### 3. Get Database Credentials

1. Go to **Project overview** → **connect**
2. Copy these values for your `.env`:

## Application Deployment (Vercel)

### 1. Modify Build Command

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Build and Development**
3. Change the **Build Command** to:
```bash
npm run db:generate && npm run build
```

### 2. Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add all variables from your `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
```

## Post-Deployment Setup

### 1. Seed Demo Data

After deployment, seed the database with demo data:

1. Access your deployed app
2. Go to `/api/admin/seed` (if you create this endpoint)
3. Or run the seed script locally:

```bash
npm run seed
```