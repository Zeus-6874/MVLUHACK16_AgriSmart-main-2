# Admin User Setup Guide

This guide explains how to set up admin access for the AgriSmart application.

## Overview

The admin panel (`/admin/data`) is protected by Clerk authentication and an optional `ADMIN_USER_IDS` environment variable. Only users whose Clerk user IDs are listed in this variable can access admin functions.

## Step 1: Get Your Clerk User ID

### Method 1: From Clerk Dashboard (Recommended)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Sign in to your Clerk account
3. Select your application (the one you're using for AgriSmart)
4. Navigate to **Users** in the left sidebar
5. Find your user account (or the account you want to make admin)
6. Click on the user to open their details
7. Copy the **User ID** (it looks like `user_xxxxxxxxxxxxx`)

### Method 2: From Browser Console (Quick Method)

1. Sign in to your AgriSmart application
2. Open your browser's Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Run this JavaScript code:
   ```javascript
   // This will log your Clerk user ID
   fetch('/api/user-id').then(r => r.json()).then(console.log)
   ```
   Or check the browser's Application/Storage → Local Storage for Clerk session data.

### Method 3: Create a Temporary API Route

If the above methods don't work, you can temporarily add this route to see your user ID:

1. Create `app/api/user-id/route.ts`:
   ```typescript
   import { auth } from "@clerk/nextjs/server"
   import { NextResponse } from "next/server"

   export async function GET() {
     const { userId } = await auth()
     return NextResponse.json({ userId })
   }
   ```

2. Visit `http://localhost:3000/api/user-id` while logged in
3. Copy the `userId` from the JSON response
4. **Delete this route after use** for security

## Step 2: Configure Admin Access

1. Open your `.env.local` file (or create it if it doesn't exist)
2. Add or update the `ADMIN_USER_IDS` variable:

   ```env
   ADMIN_USER_IDS=user_xxxxxxxxxxxxx,user_yyyyyyyyyyyyy
   ```

   - Separate multiple admin user IDs with commas
   - No spaces around commas (or trim them in code)
   - Example: `ADMIN_USER_IDS=user_2abc123def456,user_2xyz789uvw012`

3. Save the file
4. Restart your development server:
   ```bash
   pnpm dev
   ```

## Step 3: Verify Admin Access

1. Sign in to AgriSmart with the account whose user ID you added
2. Navigate to `http://localhost:3000/admin/data`
3. You should see the admin data management interface
4. If you see an "Unauthorized" or "Forbidden" error, check:
   - The user ID is correct (no typos)
   - The `.env.local` file is in the project root
   - The server was restarted after adding the variable
   - You're signed in with the correct account

## Step 4: Admin Features

Once you have admin access, you can:

- **Manage Government Schemes**: Create, edit, and delete scheme entries
- **Manage Crop Encyclopedia**: Add, update, and remove crop information
- **View Statistics**: See counts of farmers, crops, reports, etc.

## Security Notes

- **Never commit `.env.local` to Git** - it's already in `.gitignore`
- **Use production environment variables** when deploying (Vercel, Railway, etc.)
- **Limit admin access** to trusted users only
- **Rotate user IDs** if an admin account is compromised

## Troubleshooting

### "UNAUTHORIZED" Error
- You're not signed in. Sign in first, then try again.

### "FORBIDDEN" Error
- Your user ID is not in `ADMIN_USER_IDS`
- Check the user ID matches exactly (case-sensitive)
- Ensure the environment variable is loaded (restart server)

### Can't Find User ID
- Make sure you're signed in to Clerk
- Check the Clerk Dashboard → Users section
- Use Method 3 (temporary API route) as a last resort

### Environment Variable Not Loading
- Ensure the file is named `.env.local` (not `.env` or `.env.local.txt`)
- Restart the development server after changes
- Check for typos in the variable name (`ADMIN_USER_IDS`)

## Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. Go to your hosting platform's environment variables settings
2. Add `ADMIN_USER_IDS` with your admin user IDs (comma-separated)
3. Redeploy your application
4. Test admin access in production

---

**Need Help?** Check the main `SETUP_INSTRUCTIONS.md` or review the admin route code in `app/api/admin/*/route.ts` to understand the authentication logic.

