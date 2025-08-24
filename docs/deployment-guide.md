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

### 3. Set Up Row Level Security (RLS)

Run these policies in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_notes ENABLE ROW LEVEL SECURITY;

-- Student policies
CREATE POLICY "Students can view own profile" ON students
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Students can update own profile" ON students
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Application policies
CREATE POLICY "Students can manage own applications" ON applications
  FOR ALL USING (auth.uid()::text = student_id::text);

-- Parent policies (add after implementing parent-student relationships)
CREATE POLICY "Parents can view linked students' applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_parent_relationships spr
      JOIN users u ON u.id = spr.parent_id
      WHERE spr.student_id = applications.student_id
      AND u.id::text = auth.uid()::text
    )
  );
```

### 4. Get Database Credentials

1. Go to **Settings** → **Database**
2. Copy these values for your `.env`:
   - **Host**: `db.xxx.supabase.co`
   - **Port**: `5432`
   - **Database name**: `postgres`
   - **Username**: `postgres`
   - **Password**: (the one you set during project creation)

## Application Deployment (Vercel)

### 1. Environment Variables

Create a `.env.local` file with these variables:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"

```

### 2. Deploy to Vercel

#### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project root:
```bash
vercel
```

4. Follow the prompts:
   - **Set up and deploy**: Yes
   - **Which scope**: Your account
   - **Link to existing project**: No
   - **Project name**: `university-tracker`
   - **Directory**: `./` (current directory)
   - **Override settings**: No

#### Method 2: GitHub Integration

1. Push code to GitHub repository
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add environment variables (see section below)
7. Click "Deploy"

### 3. Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add all variables from your `.env.local`:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT_REF].supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[YOUR_ANON_KEY]` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `[YOUR_SERVICE_ROLE_KEY]` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `your-super-secret-key-here` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |

## Post-Deployment Setup

### 1. Seed Demo Data

After deployment, seed the database with demo data:

1. Access your deployed app
2. Go to `/api/admin/seed` (if you create this endpoint)
3. Or run the seed script locally:

```bash
npm run seed
```

### 2. Test Authentication

1. Register a test student account
2. Register a test parent account
3. Link parent to student (if implementing this feature)
4. Test all major workflows

### 3. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

## Monitoring and Maintenance

### 1. Vercel Analytics

Enable Vercel Analytics for performance monitoring:

1. Go to **Analytics** tab in Vercel dashboard
2. Enable analytics for your project
3. Monitor Core Web Vitals and page performance

### 2. Error Tracking

Consider integrating error tracking:

```bash
npm install @sentry/nextjs
```

### 3. Database Monitoring

Monitor your Supabase database:

1. Go to Supabase dashboard → **Reports**
2. Monitor database size, connections, and performance
3. Set up alerts for high usage

### 4. Backup Strategy

Supabase provides automatic backups, but consider:

1. Regular database exports for critical data
2. Testing backup restoration procedures
3. Documenting recovery procedures

## Security Checklist

- [ ] Environment variables are secure and not exposed
- [ ] Database RLS policies are properly configured
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] JWT secrets are strong and secure
- [ ] CORS is properly configured
- [ ] Input validation is implemented
- [ ] SQL injection protection is in place
- [ ] Authentication flows are secure

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if Supabase project is active
- Ensure IP allowlist includes Vercel IPs (usually not needed)

#### 2. Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure JWT secret is configured

#### 3. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are listed in `package.json`
- Review build logs in Vercel dashboard

#### 4. Environment Variable Issues
- Double-check variable names (case sensitive)
- Ensure all required variables are set
- Redeploy after adding new variables

### Getting Help

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
3. Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)

## Performance Optimization

### 1. Database Optimization
- Add indexes on frequently queried columns
- Use database connection pooling
- Implement query optimization

### 2. Frontend Optimization
- Enable Next.js Image optimization
- Implement proper caching strategies
- Use dynamic imports for code splitting

### 3. API Optimization
- Implement rate limiting
- Use database query optimization
- Add response caching where appropriate

## Scaling Considerations

### Database Scaling
- Monitor database performance metrics
- Consider read replicas for high read loads
- Implement database sharding if needed

### Application Scaling
- Vercel automatically handles scaling
- Monitor function execution times
- Consider edge functions for better performance

### Storage Scaling
- Implement file upload limits
- Use CDN for static assets
- Consider external storage services for large files