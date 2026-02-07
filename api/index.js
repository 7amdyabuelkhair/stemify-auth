const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate random alphanumeric code (6 characters)
function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate unique student ID
function generateStudentId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomCode = generateRandomCode(6);
  return `STEM-${year}${month}${day}-${randomCode}`;
}

// Create JWT token
function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'stemify-jwt-secret-change-in-production',
    { expiresIn: '7d' }
  );
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const path = req.url.split('?')[0];

  // Sign Up
  if (method === 'POST' && path === '/api/signup') {
    try {
      const { name, number, parentName, parentNumber, email, password, school } = req.body;

      if (!name || !number || !parentName || !parentNumber || !email || !password || !school) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Generate student ID
      let studentId;
      let isUnique = false;
      while (!isUnique) {
        studentId = generateStudentId();
        const { data: existing } = await supabase
          .from('users')
          .select('student_id')
          .eq('student_id', studentId)
          .single();
        if (!existing) {
          isUnique = true;
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert user
      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            student_id: studentId,
            name,
            number,
            parent_name: parentName,
            parent_number: parentNumber,
            email: email.toLowerCase(),
            password: hashedPassword,
            school
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const token = createToken(user.id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: user.id,
          studentId: user.student_id,
          name: user.name,
          email: user.email,
          school: user.school
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Sign In
  if (method === 'POST' && path === '/api/signin') {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Get user with password
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = createToken(user.id);

      return res.json({
        success: true,
        message: 'Signed in successfully',
        token,
        user: {
          id: user.id,
          studentId: user.student_id,
          name: user.name,
          email: user.email,
          school: user.school
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Admin: Get all students
  if (method === 'GET' && path === '/api/admin/students') {
    const adminKey = req.query.adminKey || req.headers['x-admin-key'];
    const validAdminKey = process.env.ADMIN_KEY || 'admin-stemify-2024';

    if (adminKey !== validAdminKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Admin key required.'
      });
    }

    try {
      const { data: students, error } = await supabase
        .from('users')
        .select('student_id, name, email, number, parent_name, parent_number, school, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json({
        success: true,
        count: students.length,
        students: students.map(s => ({
          studentId: s.student_id,
          name: s.name,
          email: s.email,
          number: s.number,
          parentName: s.parent_name,
          parentNumber: s.parent_number,
          school: s.school,
          createdAt: s.created_at
        }))
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error'
      });
    }
  }

  // Health check
  if (method === 'GET' && path === '/api') {
    return res.json({
      message: 'STEMify API is running',
      endpoints: {
        signup: 'POST /api/signup',
        signin: 'POST /api/signin',
        adminStudents: 'GET /api/admin/students?adminKey=YOUR_KEY'
      }
    });
  }

  return res.status(404).json({ message: 'Not found' });
};

