# STEMify Auth - Free Hosting (Vercel + Supabase)

**100% FREE** authentication system with automatic student ID generation.

## 🆓 Free Services Used

1. **Vercel** - Free hosting (unlimited requests)
2. **Supabase** - Free PostgreSQL database (500MB free)

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Database (FREE)

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create a new project
3. Go to **SQL Editor** → Run this SQL:

```sql
-- Create users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  number VARCHAR(50) NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  parent_number VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  school VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_student_id ON users(student_id);
```

4. Go to **Settings** → **API** → Copy:
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_ANON_KEY)

### Step 2: Deploy to Vercel (FREE)

1. Push this code to GitHub
2. Go to [vercel.com](https://vercel.com) → Sign up (free)
3. Click **Add New Project**
4. Import your GitHub repository
5. Add Environment Variables:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
   - `JWT_SECRET` = any random secret (e.g., `my-secret-key-123`)
   - `ADMIN_KEY` = your admin key (e.g., `admin-stemify-2024`)
6. Click **Deploy**

**Done!** You'll get a URL like: `https://your-project.vercel.app`

## 📝 API Endpoints

### Sign Up
```
POST https://your-project.vercel.app/api/signup
Body: { name, number, parentName, parentNumber, email, password, school }
Response: { success, token, user: { studentId, name, email, school } }
```

### Sign In
```
POST https://your-project.vercel.app/api/signin
Body: { email, password }
Response: { success, token, user: { studentId, name, email, school } }
```

### Admin: View All Students
```
GET https://your-project.vercel.app/api/admin/students?adminKey=admin-stemify-2024
Response: { success, count, students: [...] }
```

## 🎓 Student ID Format

- **Format:** `STEM-YYYYMMDD-XXXXXX`
- **Example:** `STEM-20240207-A3B9K2`
- Automatically generated on signup
- Unique for each student

## 🔐 Admin Access

Default admin key: `admin-stemify-2024`

Change it by setting `ADMIN_KEY` environment variable in Vercel.

## ✅ Why This Solution?

- ✅ **100% FREE** - No credit card needed
- ✅ **Easy setup** - 5 minutes
- ✅ **No local server** - Everything in the cloud
- ✅ **Automatic student IDs** - Generated on signup
- ✅ **Admin dashboard** - View all students
- ✅ **Reliable** - Vercel and Supabase are very stable

## 📱 Update Your Frontend

Change your `signin.html` API URL to:
```javascript
const API_BASE = 'https://your-project.vercel.app';
```

That's it! 🎉

