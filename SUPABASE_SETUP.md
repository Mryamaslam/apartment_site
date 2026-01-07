# Supabase Setup - Quick Guide

## ✅ Your Credentials (Already Configured)

- **Project URL**: `https://sektognkqfxoesxjcsms.supabase.co`
- **API Key**: `sb_publishable_FhH4JbhF5ha0T13mcHXA2Q_DAriiqtR`

These are already set in `js/supabase-client.js`

## 📋 What You Need to Do in Supabase Dashboard

### Step 1: Create the Database Table

1. Go to: https://app.supabase.com/project/sektognkqfxoesxjcsms
2. Click **"Table Editor"** in the left sidebar
3. Click **"New Table"**
4. Name it: `form_submissions`
5. Add these columns:

| Column Name | Type | Default Value | Nullable | Primary Key |
|------------|------|---------------|----------|-------------|
| `id` | `uuid` | `uuid_generate_v4()` | No | ✅ Yes |
| `created_at` | `timestamptz` | `now()` | No | No |
| `full_name` | `text` | - | No | No |
| `phone_number` | `text` | - | No | No |
| `email` | `text` | - | ✅ Yes | No |
| `apartment_type` | `text` | - | ✅ Yes | No |
| `user_type` | `text` | - | ✅ Yes | No |
| `message` | `text` | - | ✅ Yes | No |

6. Click **"Save"**

### Step 2: Enable Row Level Security (RLS)

1. In the **Table Editor**, click on your `form_submissions` table
2. Click the **"Policies"** tab (or go to **Authentication → Policies**)
3. Click **"Enable RLS"** if not already enabled

### Step 3: Create Policies (Allow Public Access)

You need 3 policies:

#### Policy 1: Allow Anyone to Insert (Submit Forms)
- Click **"New Policy"**
- Name: `Allow public insert`
- Allowed operation: `INSERT`
- Target roles: `anon`, `authenticated`
- USING expression: `true`
- WITH CHECK expression: `true`
- Click **"Save"**

#### Policy 2: Allow Anyone to Read (For Admin Panel)
- Click **"New Policy"**
- Name: `Allow public read`
- Allowed operation: `SELECT`
- Target roles: `anon`, `authenticated`
- USING expression: `true`
- Click **"Save"**

#### Policy 3: Allow Anyone to Delete (For Admin Panel)
- Click **"New Policy"**
- Name: `Allow public delete`
- Allowed operation: `DELETE`
- Target roles: `anon`, `authenticated`
- USING expression: `true`
- Click **"Save"`

### Step 4: Verify API Key

1. Go to **Settings → API**
2. Under **"Project API keys"**, find the **"anon public"** key
3. It should match: `sb_publishable_FhH4JbhF5ha0T13mcHXA2Q_DAriiqtR`
4. If different, update `js/supabase-client.js` with the correct key

## 🧪 Testing

1. **Deploy your code** to Hostinger (Git auto-deploy)
2. **Open your website** and go to the contact form
3. **Submit a test form**
4. **Check Supabase Dashboard**:
   - Go to **Table Editor → form_submissions**
   - You should see your test submission!
5. **Open Admin Panel**:
   - Go to `admin/login.html`
   - Login and check dashboard
   - Submissions should appear!

## 🔒 Security Note

The current setup allows **public access** (anyone can read/write/delete). For production, you should:

1. **Restrict DELETE** to authenticated users only
2. **Restrict SELECT** to authenticated users only
3. **Keep INSERT public** (so forms work)

But for now, this setup will work perfectly for your needs!

## ❌ Troubleshooting

### "Supabase client is not configured"
- Check that `js/supabase-client.js` has correct URL and key
- Check browser console for errors

### "Failed to save submission"
- Check Supabase dashboard → Table Editor → form_submissions exists
- Check RLS policies are enabled and allow INSERT
- Check browser console for detailed error

### "No submissions in admin panel"
- Check RLS policies allow SELECT
- Check browser console for errors
- Verify table name is exactly `form_submissions` (case-sensitive)

## ✅ You're Done!

Once you complete Steps 1-3 above, your form will work perfectly with Supabase - no PHP needed!

