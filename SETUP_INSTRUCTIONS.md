# API Keys Setup Instructions

## 🔑 Required API Keys

Your application needs the following API keys to function properly:

### 1. **Clerk Authentication** (Required)
- **Purpose**: User authentication and session management
- **Where to get**: [Clerk Dashboard](https://dashboard.clerk.com/)
- **Steps**:
  1. Sign up/Login to Clerk
  2. Create a new application (or use existing)
  3. Go to **API Keys** section
  4. Copy the **Publishable Key** and **Secret Key**

### 2. **Supabase Database** (Required)
- **Purpose**: Database for storing application data
- **Where to get**: [Supabase Dashboard](https://supabase.com/dashboard)
- **Steps**:
  1. Sign up/Login to Supabase
  2. Create a new project (or use existing)
  3. Go to **Settings** → **API**
  4. Copy:
     - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
     - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
     - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

### 3. **OpenWeatherMap API** (Optional)
- **Purpose**: Real-time weather data
- **Where to get**: [OpenWeatherMap](https://openweathermap.org/api)
- **Steps**:
  1. Sign up for free account
  2. Go to **API keys** section
  3. Copy your API key
  4. Note: Weather features will work with mock data if not provided

## 📝 Setup Steps

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the root directory of your project (same level as `package.json`).

### Step 2: Copy the template

Copy the contents from `.env.example` to `.env.local`:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env.local

# On Mac/Linux
cp .env.example .env.local
```

### Step 3: Fill in your API keys

Open `.env.local` and replace the placeholder values with your actual API keys:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# OpenWeatherMap (Optional)
OPENWEATHER_API_KEY=YOUR_WEATHER_API_KEY_HERE
```

### Step 4: Verify setup

Run the development server to check if everything is configured:

```bash
pnpm dev
```

If you see any errors about missing environment variables, double-check your `.env.local` file.

## ⚠️ Important Security Notes

1. **Never commit `.env.local` to Git** - It's already in `.gitignore`
2. **Never share your API keys** - Especially the `CLERK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
3. **Use different keys for development and production**
4. **Rotate keys if they're accidentally exposed**

## 🚀 Quick Start Checklist

- [ ] Created `.env.local` file
- [ ] Added Clerk Publishable Key
- [ ] Added Clerk Secret Key
- [ ] Added Supabase URL
- [ ] Added Supabase Anon Key
- [ ] Added Supabase Service Role Key
- [ ] (Optional) Added OpenWeatherMap API Key
- [ ] Tested the application with `pnpm dev`

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenWeatherMap API Docs](https://openweathermap.org/api)

## 🆘 Troubleshooting

### Error: "Missing environment variable"
- Make sure `.env.local` exists in the project root
- Check that variable names match exactly (case-sensitive)
- Restart your development server after adding keys

### Error: "Invalid API key"
- Verify you copied the entire key (they're long!)
- Check for extra spaces or newlines
- Make sure you're using the correct key type (publishable vs secret)

### Clerk authentication not working
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_`
- Verify `CLERK_SECRET_KEY` starts with `sk_`
- Check Clerk dashboard for any errors

### Supabase connection issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` is your full project URL
- Check that your Supabase project is not paused
- Verify RLS (Row Level Security) policies are set up correctly




