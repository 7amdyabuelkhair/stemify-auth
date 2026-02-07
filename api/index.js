import express from 'express';
import cors from 'cors';

const app = express();

// هنا تحط CORS قبل أي route
app.use(cors({
  origin: ['http://localhost:8000'], // الدومين اللي هيبعت requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json()); // علشان يقدر يقرأ JSON من body

// مثال route
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  // عملية التسجيل هنا
  res.json({ success: true, user: { name, email }, token: 'FAKE_TOKEN' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
