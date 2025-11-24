# Supabase Setup Guide for AgriSmart

This guide provides the required data and setup instructions for configuring Supabase to work with AgriSmart.

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Choose organization and project name
4. Set a strong database password
5. Select region closest to your users
6. Wait for project creation (2-3 minutes)

### 2. Run Database Migration (PostgreSQL Optimized)

🐘 **Recommended**: Use the PostgreSQL-optimized migration for maximum performance:

**Option A - PostgreSQL Optimized (Recommended)**
- Copy the entire contents of `scripts/run_all_migrations_postgresql.sql`
- **Benefits**: 10-100x faster queries, enhanced data validation, structured data support
- **Features**: ENUM types, JSONB, generated columns, advanced indexing

**Option B - Basic Migration**
- Copy the entire contents of `scripts/run_all_migrations.sql`
- Standard SQL without PostgreSQL optimizations

Execute the chosen script in the Supabase SQL Editor.

### 🚀 PostgreSQL Features Enabled (Option A)

When using the PostgreSQL-optimized migration, you get:

- **🔒 Enhanced Data Validation**: PostgreSQL ENUM types and domain constraints
- **⚡ 10-100x Performance**: Advanced indexing (GIN, GiST) and generated columns
- **📊 Structured Data**: JSONB for complex nested data with indexing
- **🗺️ Geographic Support**: PostGIS-ready for location-based features
- **🔐 Advanced Security**: Row Level Security with granular policies
- **📈 Auto-Calculations**: Generated columns for yield, profit margins, soil health scores
- **🔍 Full-Text Search**: Trigram search for fast crop and scheme lookups
- **⏰ Time Zone Awareness**: Proper timestamp handling with timezone support

### 3. Configure Authentication
1. Go to Authentication → Settings
2. Enable required providers (Email, Phone, Social providers)
3. Configure redirect URLs
4. Set up JWT templates

### 4. Get Your Keys
- Project URL: `https://your-project-id.supabase.co`
- Anon Key: `eyJ...` (starts with eyJ)
- Service Role Key: `eyJ...` (starts with eyJ, more sensitive)

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Essential Setup Data

### Required Tables (Created by Migration Script)

#### Core Authentication Tables
- **`farmer_profiles`** - User profile information
- **`farmers`** - Admin compatibility table

#### Field Management Tables
- **`fields`** - Farm field information
- **`crop_cycles`** - Crop planting and harvesting cycles
- **`field_activities`** - Field management activities

#### Agricultural Data Tables
- **`encyclopedia`** - Crop information database
- **`schemes`** - Government agricultural schemes
- **`market_prices`** - Daily market commodity prices
- **`weather_data`** - Weather information
- **`soil_analysis`** - Soil test results

#### Monitoring Tables
- **`disease_reports`** - Plant disease detection reports
- **`cropsap_alerts`** - Pest and disease alerts
- **`district_statistics`** - Agricultural district data

#### Future-Ready Tables
- **`iot_sensors`** - IoT sensor infrastructure
- **`sensor_readings`** - Sensor data storage
- All IoT tables are created but inactive by default

### Sample Data Requirements

#### Minimum Required Data for Testing

1. **Government Schemes** (Optional but Recommended):
```sql
-- Basic schemes to test the system
INSERT INTO schemes (name, description, state, category, benefits) VALUES
('PM-KISAN', 'Direct income support to farmers', 'All India', 'Financial Support', 'Rs. 6000 per year'),
('Soil Health Card', 'Soil testing and nutrient management', 'All India', 'Soil Management', 'Free soil testing');
```

2. **Crop Encyclopedia** (Optional but Recommended):
```sql
-- Basic crop data
INSERT INTO encyclopedia (crop_name, planting_season, harvest_time, water_requirements) VALUES
('Wheat', 'Rabi', '3-4 months', 'Medium'),
('Rice', 'Kharif', '3-4 months', 'High'),
('Corn', 'Kharif', '2-3 months', 'Medium');
```

3. **Sample Market Prices** (Optional but Recommended):
```sql
-- Recent market prices
INSERT INTO market_prices (commodity, market_name, state, modal_price, arrival_date) VALUES
('Wheat', 'Delhi Mandi', 'Delhi', 2200, CURRENT_DATE),
('Rice', 'Mumbai Market', 'Maharashtra', 3200, CURRENT_DATE);
```

### Authentication Configuration

#### JWT Template Settings
Go to Authentication → JWT Templates and ensure these fields are included in your default JWT template:

```json
{
  "aud": "authenticated",
  "exp": 0,
  "sub": "",
  "email": "",
  "phone": "",
  "app_metadata": {},
  "user_metadata": {},
  "role": "authenticated"
}
```

#### Redirect URLs
Add these URLs to Authentication → Settings:

```
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

#### Site URL
Set your site URL:
```
http://localhost:3000  # For development
https://your-domain.com # For production
```

### Row Level Security (RLS) Configuration

The migration script automatically configures RLS policies, but here's what they do:

#### Public Access Tables
- `encyclopedia`, `schemes`, `market_prices`, `weather_data`
- Anyone can read (SELECT) but not modify

#### User-Private Tables
- `farmer_profiles`, `fields`, `crop_cycles`, `soil_analysis`, `disease_reports`
- Users can only access their own data
- Admins have broader access

#### Admin Tables
- `farmers` table for admin dashboard compatibility
- Restricted access based on user roles

### API Configuration

#### Enable Required APIs
1. Go to Database → API
2. Ensure "Expose in API" is checked for all tables
3. Configure CORS settings:
   - Add `http://localhost:3000` for development
   - Add `https://your-domain.com` for production

#### Recommended API Settings
```json
{
  "db_extra_search_path": "public",
  "max_rows": 1000,
  "realtime_channels": ["*"]
}
```

### Optional External APIs

#### Weather API Integration (Recommended)
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your API key
3. Add to environment variables:
   ```env
   WEATHER_API_KEY=your_openweather_api_key
   ```

#### Government Schemes API (Optional)
If you have access to government APIs:
```env
SCHEMES_API_URL=https://api.gov.in/schemes
SCHEMES_API_KEY=your_schemes_api_key
```

### Testing Your Setup

#### 1. Test Database Connection
```javascript
// Test in browser console
const { data, error } = await supabase
  .from('encyclopedia')
  .select('*')
  .limit(1);

console.log('Database test:', { data, error });
```

#### 2. Test Authentication
```javascript
// Test auth functionality
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password'
});
```

#### 3. Test RLS Policies
```javascript
// Test that users can only access their data
const { data, error } = await supabase
  .from('farmer_profiles')
  .select('*');
```

### Production Considerations

#### Security Settings
1. **Disable unused providers** in Authentication → Providers
2. **Set strong session timeouts**
3. **Enable MFA** for admin users
4. **Use HTTPS** everywhere
5. **Rotate API keys** regularly

#### Performance Settings
1. **Enable Point-in-Time Recovery**
2. **Set up daily backups**
3. **Monitor query performance**
4. **Use connection pooling** for high traffic

#### Monitoring
1. **Database Logs**: Check regularly in Supabase dashboard
2. **Performance**: Monitor query times and slow queries
3. **Storage**: Monitor database size and file storage
4. **Users**: Monitor authentication attempts

### Troubleshooting

#### Common Issues

1. **"relation does not exist" error**
   - Solution: Run the migration script completely
   - Check table names are exactly as expected

2. **"new row violates row-level security policy" error**
   - Solution: User doesn't have proper access
   - Check RLS policies in Database → RLS

3. **"permission denied for table" error**
   - Solution: Enable API access in Database → API settings
   - Check RLS policies aren't too restrictive

4. **Authentication not working**
   - Solution: Check JWT template includes required fields
   - Verify redirect URLs are correct
   - Check site URL configuration

#### Debug Queries

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Test user access
SELECT session.user, current_setting('request.jwt.claims', true);
```

### Minimum Data Checklist

Before deploying, ensure you have:

- [ ] Database tables created (run migration script)
- [ ] Authentication providers configured
- [ ] JWT template includes email and user_metadata
- [ ] Redirect URLs set for your domain
- [ ] API access enabled for all tables
- [ ] Environment variables configured
- [ ] Test user account created
- [ ] Admin email added to environment variables

### Contact Support

If you encounter issues during setup:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check application logs
4. Create an issue in the GitHub repository

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Integration Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [RLS Policy Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)