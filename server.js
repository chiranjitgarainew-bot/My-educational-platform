/**
 * SERVER SIDE CODE (Node.js + Express + MongoDB)
 * 
 * Instructions to Run:
 * 1. Install Node.js
 * 2. Create a folder, move this file inside.
 * 3. Run: npm install express mongoose cors dotenv
 * 4. Run: node server.js
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. DATABASE CONNECTION (MongoDB) ---
// Replace with your MongoDB Connection String (e.g., from MongoDB Atlas)
const MONGO_URI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/study-platform?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Database'))
  .catch(err => console.error('❌ Database Connection Error:', err));

// --- 2. DATABASE SCHEMAS (DATA MODELS) ---

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, hash this!
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar: String,
  phone: String,
  dob: String,
  address: String,
  enrolledBatches: [String], // Array of Batch IDs
  createdAt: { type: Date, default: Date.now }
});

// Class Content Schema (Videos)
const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  batchId: { type: String, required: true },
  videoUrl: { type: String, required: true },
  description: String,
  timestamp: { type: Date, default: Date.now }
});

// Enrollment/Payment Request Schema
const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userEmail: String,
  batchId: String,
  batchName: String,
  amount: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Content = mongoose.model('Content', ContentSchema);
const Request = mongoose.model('Request', RequestSchema);

// --- 3. API ROUTES ---

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || user.password !== req.body.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Content
app.get('/api/content', async (req, res) => {
  const content = await Content.find().sort({ timestamp: -1 });
  res.json(content);
});

// Upload Content (Admin)
app.post('/api/content', async (req, res) => {
  const newContent = new Content(req.body);
  await newContent.save();
  res.json(newContent);
});

// Create Payment Request
app.post('/api/requests', async (req, res) => {
  const reqData = new Request(req.body);
  await reqData.save();
  res.json(reqData);
});

// Get Requests (Admin)
app.get('/api/requests', async (req, res) => {
  const requests = await Request.find().sort({ timestamp: -1 });
  res.json(requests);
});

// Approve Request (Admin)
app.post('/api/requests/:id/approve', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'approved';
    await request.save();

    // Add batch to user
    const user = await User.findById(request.userId);
    if (user && !user.enrolledBatches.includes(request.batchId)) {
      user.enrolledBatches.push(request.batchId);
      await user.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
