# AgriSmart Deployment Guide

This guide will help you deploy AgriSmart, a comprehensive crop and soil management web application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Authentication Setup](#authentication-setup)
5. [Application Deployment](#application-deployment)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services
- **Node.js** (v18 or higher)
- **Supabase Account** (PostgreSQL database + Auth)
- **Clerk Account** (Authentication provider)
- **Vercel, Netlify, or similar hosting platform**

### Optional Services
- **OpenWeatherMap API** (Weather data)
- **AWS S3** (File storage)
- **SendGrid** (Email notifications)
- **Twilio** (SMS notifications)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AgriSmart.git
cd AgriSmart
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Copy the environment template and configure your variables:

```bash
cp .env.example .env.local
```

**Required Variables:**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Access
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### 4. Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Configure JWT Templates:
   - Include `user_id`, `email`, `full_name` in the token
4. Set up social providers if needed (Google, Facebook, etc.)
5. Copy your keys to `.env.local`

### 5. Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Run the database migration script:

   ```sql
   -- Copy the entire content of:
   -- scripts/run_all_migrations.sql
   ```

4. Configure Row Level Security (RLS) policies are included in the script
5. Set up Authentication providers in Supabase if needed

## Database Setup

### Running Migrations

1. Open Supabase SQL Editor
2. Run the consolidated migration script:
   ```sql
   -- File: scripts/run_all_migrations.sql
   ```

This script creates:
- Farmer profiles and fields tables
- Crop management and soil analysis tables
- Market prices and government schemes
- Weather data and disease reports
- IoT sensor infrastructure (ready for future use)

### Verifying Database Setup

Check that all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables include:
- `farmer_profiles`
- `farmers` (admin compatibility)
- `fields`
- `crop_cycles`
- `soil_analysis`
- `market_prices`
- `schemes`
- `encyclopedia`
- `weather_data`
- And more...

### Sample Data (Optional)

You can run the sample data script to populate initial data:

```sql
-- File: scripts/002_seed_sample_data.sql
```

## Application Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from your `.env.local`

### Option 2: Netlify

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   npx netlify deploy --prod --dir=.next
   ```

3. **Set environment variables in Netlify dashboard**

### Option 3: Docker Deployment

1. **Build Docker image:**
   ```bash
   docker build -t agrismart .
   ```

2. **Run container:**
   ```bash
   docker run -p 3000:3000 --env-file .env.local agrismart
   ```

### Environment-Specific Configurations

#### Production (.env.production)
```env
NODE_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Development (.env.development)
```env
NODE_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Post-Deployment Checklist

### 1. Authentication Testing
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout functions correctly
- [ ] Admin access works with configured admin emails

### 2. Database Connectivity
- [ ] Can fetch farmer profiles
- [ ] Can create new fields
- [ ] Market prices data loads
- [ ] Soil analysis saves correctly

### 3. Core Functionality
- [ ] Dashboard loads with real data
- [ ] Field management works
- [ ] Soil health page functions
- [ ] Weather data displays
- [ ] Mobile responsive design works

### 4. Admin Panel
- [ ] Admin login works
- [ ] Dashboard shows correct statistics
- [ ] Can add/manage crops
- [ ] Can add market prices
- [ ] Data export works

### 5. Performance
- [ ] Page load time under 3 seconds
- [ ] Mobile performance acceptable
- [ ] No JavaScript errors in console
- [ ] Images load properly

### 6. Security
- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] RLS policies working in Supabase
- [ ] Rate limiting considered

## Monitoring and Maintenance

### Error Tracking
Set up Sentry for error monitoring:
```env
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn
SENTRY_DSN=your_private_sentry_dsn
```

### Performance Monitoring
- Google Analytics:
  ```env
  NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
  ```

### Database Maintenance
1. **Regular Backups:** Enable in Supabase dashboard
2. **Monitoring:** Check query performance regularly
3. **Updates:** Apply migrations carefully in production

### Log Monitoring
Monitor application logs for:
- Authentication failures
- Database errors
- API rate limiting
- Performance issues

## Troubleshooting

### Common Issues

#### 1. Clerk Authentication Not Working
**Solution:**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is correct
- Check that redirect URLs match in Clerk dashboard
- Ensure JWT template includes required fields

#### 2. Supabase Connection Issues
**Solution:**
- Verify Supabase URL and keys
- Check RLS policies aren't too restrictive
- Test connection in Supabase dashboard

#### 3. Build Errors
**Solution:**
- Run `npm install` to ensure dependencies
- Check for TypeScript errors
- Verify all environment variables are set

#### 4. Mobile Responsiveness Issues
**Solution:**
- Test on actual devices
- Check viewport meta tag
- Verify responsive grid layouts

#### 5. Admin Access Not Working
**Solution:**
- Add admin email to `NEXT_PUBLIC_ADMIN_EMAILS`
- Check admin logic in admin pages
- Verify Clerk user metadata if using role-based access

### Debug Mode
Enable debug mode for development:
```env
NEXT_PUBLIC_DEBUG_MODE=true
```

### Performance Optimization

1. **Image Optimization:**
   ```bash
   npm install next/image-optimization
   ```

2. **Database Optimization:**
   - Add indexes to frequently queried columns
   - Use Supabase connection pooling
   - Implement caching strategies

3. **Frontend Optimization:**
   - Use Next.js Image component
   - Implement lazy loading
   - Minimize bundle size

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use different keys for development/staging/production
   - Regularly rotate secret keys

2. **Database Security:**
   - RLS policies are configured
   - Admin operations should use service role key
   - Regular security audits

3. **API Security:**
   - Rate limiting considerations
   - Input validation
   - CORS configuration

## Scaling Considerations

### When to Scale
- Database queries become slow
- Application takes >3 seconds to load
- Memory usage consistently >80%

### Scaling Options
1. **Database:** Upgrade Supabase plan
2. **CDN:** Implement CloudFlare
3. **Serverless:** Consider serverless functions
4. **Load Balancing:** Multiple app instances

## Backup and Recovery

### Database Backups
- Enable daily backups in Supabase
- Test restore procedures
- Export critical data regularly

### Application Backups
- Version control for code
- Environment variables backup
- Configuration backup

## Support

For deployment issues:
1. Check this documentation first
2. Review error logs
3. Test in development environment
4. Contact support if needed

## License

This deployment guide is part of the AgriSmart project. See LICENSE file for details.