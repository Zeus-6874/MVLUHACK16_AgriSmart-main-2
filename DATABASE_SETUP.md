# Database Setup Guide

This guide will help you set up your Supabase database with all required tables.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with your credentials in `.env.local`
2. **SQL Editor Access**: Access to Supabase SQL Editor (Dashboard → SQL Editor)

## Migration Order

Run these SQL scripts **in order** in your Supabase SQL Editor:

### 1. Base Schema
```sql
-- Run: scripts/001_create_database_schema.sql
```
Creates: `farmers`, `encyclopedia`, `schemes`, `market_prices`, `crop_varieties`, `weather_data`, `soil_analysis`, `disease_reports`

### 2. Auth Integration
```sql
-- Run: scripts/003_update_schema_for_auth.sql
```
Updates: Adds `user_id` to farmers, creates auth triggers, updates RLS policies

### 3. Market Data Schema
```sql
-- Run: scripts/004_create_market_data_schema.sql
```
Creates: `market_price_sources`, `market_prices`, `market_price_history` (new structure)

### 4. Knowledge Base Schema ⚠️ **REQUIRED FOR SEED SCRIPTS**
```sql
-- Run: scripts/005_create_knowledge_schema.sql
```
Creates: `scheme_categories`, `schemes` (new structure), `crop_categories`, `crops`, `crop_notes`

### 5. Farmer Profiles
```sql
-- Run: scripts/006_create_farmer_profiles.sql
```
Creates: `farmer_profiles` table

### 6. CROPSAP & District Stats
```sql
-- Run: scripts/007_create_cropsap_schema.sql
```
Creates: `cropsap_alerts`, `district_statistics`

## ⚠️ IMPORTANT: If You Already Have a Schemes Table

If you're getting the error: `Could not find the 'category_id' column of 'schemes'`, you need to update your existing `schemes` table:

**Quick Fix**: Run `scripts/update_schemes_to_new_schema.sql` in Supabase SQL Editor first!

This script will:
- Create `scheme_categories` table
- Add `category_id` and other missing columns to your existing `schemes` table
- Migrate data from old columns to new columns
- Set up proper indexes and RLS policies

## Quick Setup Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. For each script in order (001 → 007):
   - Click **New Query**
   - Copy the entire contents of the SQL file
   - Paste into the editor
   - Click **Run** (or press `Ctrl+Enter`)
   - Verify success message

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Verification

After running all migrations, verify tables exist:

```sql
-- Run this in SQL Editor to check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `crop_categories`
- `crop_notes`
- `crops`
- `cropsap_alerts`
- `district_statistics`
- `farmer_profiles`
- `market_price_history`
- `market_price_sources`
- `market_prices`
- `scheme_categories` ⚠️ **This is required for seed scripts**
- `schemes`
- ... and other tables

## After Migrations

Once all tables are created, you can run seed scripts:

```bash
# Seed schemes (requires scheme_categories table)
pnpm seed:schemes

# Seed crops (requires crop_categories table)
pnpm seed:crops

# Seed CROPSAP alerts
pnpm seed:cropsap

# Seed district statistics
pnpm seed:district

# Ingest market prices from Agmarknet
pnpm seed:market
```

## Troubleshooting

### Error: "Could not find the table 'public.scheme_categories'"
**Solution**: Run `scripts/005_create_knowledge_schema.sql` in Supabase SQL Editor

### Error: "relation already exists"
**Solution**: The table already exists. You can either:
- Skip that migration
- Drop the table first (⚠️ will delete data): `DROP TABLE IF EXISTS table_name CASCADE;`

### Error: "permission denied"
**Solution**: Make sure you're using the **Service Role Key** (not anon key) in your seed scripts, or run migrations as a database admin.

## Important Notes

- **Run migrations in order** - Some tables depend on others
- **Backup your data** - Before running migrations on production
- **Test in development first** - Always test migrations on a dev/staging database
- **Service Role Key** - Required for seed scripts (has admin permissions)

---

**Need Help?** Check the individual SQL files for comments explaining what each migration does.

