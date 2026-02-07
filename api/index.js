const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// هنا تحط كل الـ routes (signup, signin, admin) بدون أي CORS middleware

module.exports = async (req, res) => {
  // ✅ السماح لأي دومين
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
  res.setHeader('Access-Control-Max-Age', '86400');

  // ✅ الرد مباشرة على preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 204 أفضل من 200 للOPTIONS
  }

  // ✅ إزالة /api prefix
  req.url = req.url.replace(/^\/api/, '') || '/';

  // ✅ نفذ Express app
  app(req, res);
};
