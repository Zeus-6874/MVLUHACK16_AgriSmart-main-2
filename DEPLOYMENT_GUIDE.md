# KrishiSarthi - Deployment Guide

## Overview
KrishiSarthi is an agricultural management application built with Next.js 14, Supabase, and modern web technologies. This guide will help you deploy the application to production.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Vercel account (recommended for deployment)
- OpenWeatherMap API key (optional, for weather features)

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Weather API
OPENWEATHER_API_KEY=your_openweather_api_key
\`\`\`

## Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings > API to get your project URL and anon key

### 2. Run Database Scripts
Execute the following SQL scripts in your Supabase SQL Editor in order:

1. **Create Tables**: Run `scripts/001_create_database_schema.sql`
2. **Seed Data**: Run `scripts/002_seed_sample_data.sql`  
3. **Enable Security**: Run `scripts/003_enable_rls_security.sql`

### 3. Verify Database Setup
Check that all tables are created:
- `disease_reports`
- `encyclopedia`
- `market_prices`
- `crop_varieties`
- `soil_analysis`
- `schemes`
- `weather_data`

## Local Development

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set Environment Variables**
   Copy your Supabase credentials to `.env.local`

3. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access Application**
   Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Connect Repository**
   - Push your code to GitHub
   - Connect your GitHub repository to Vercel

2. **Configure Environment Variables**
   In your Vercel project settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENWEATHER_API_KEY` (optional)

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - First deployment may take 2-3 minutes

### Option 2: Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use the Next.js runtime
- **Railway**: Connect GitHub and deploy
- **DigitalOcean App Platform**: Use Node.js buildpack

## Post-Deployment Checklist

### 1. Test Core Features
- [ ] Homepage loads correctly
- [ ] Disease detection works (uploads images)
- [ ] Market prices display
- [ ] Crop recommendations function
- [ ] Weather data loads
- [ ] Encyclopedia search works

### 2. Database Verification
- [ ] All API endpoints return data
- [ ] Database queries execute successfully
- [ ] RLS policies are active

### 3. Performance Optimization
- [ ] Images are optimized
- [ ] API responses are fast (<2s)
- [ ] No console errors in production

## Troubleshooting

### Common Issues

**1. Build Errors**
\`\`\`bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
\`\`\`

**2. Database Connection Issues**
- Verify Supabase URL and keys are correct
- Check if RLS policies allow public access
- Ensure database tables exist

**3. API Route Failures**
- Check environment variables are set
- Verify Supabase service role key has proper permissions
- Check API route logs in deployment platform

**4. Image Upload Issues**
- Ensure proper CORS settings in Supabase
- Check file size limits
- Verify storage bucket permissions

### Environment-Specific Issues

**Development:**
- Use `.env.local` for local environment variables
- Ensure Supabase project is not paused

**Production:**
- Set environment variables in deployment platform
- Use production Supabase project
- Enable proper CORS settings

## Monitoring and Maintenance

### 1. Database Monitoring
- Monitor Supabase dashboard for usage
- Set up alerts for high usage
- Regular backup of important data

### 2. Application Monitoring
- Use Vercel Analytics for performance monitoring
- Set up error tracking (Sentry recommended)
- Monitor API response times

### 3. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update Supabase client libraries

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use different Supabase projects for dev/prod
- Rotate API keys regularly

### 2. Database Security
- RLS policies are enabled by default
- Review and update policies as needed
- Monitor database access logs

### 3. API Security
- Rate limiting is handled by Vercel/platform
- Input validation in API routes
- Proper error handling without exposing sensitive data

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review Vercel/platform deployment logs
3. Check Supabase project logs
4. Verify all environment variables are set correctly

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
