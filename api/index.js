const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// هنا تحط كل الـ routes (signup, signin, admin) بدون أي CORS middleware

// Export for Vercel
module.exports = (req, res) => {
  // 1️⃣ CORS headers لأي request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');

  // 2️⃣ التعامل مع preflight request مباشرة
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3️⃣ إزالة /api prefix
  req.url = req.url.replace(/^\/api/, '') || '/';

  // 4️⃣ نفذ Express app
  app(req, res);
};
