// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB (you'd need a database like MongoDB)
// mongoose.connect('mongodb://localhost:27017/lethabo');

// User model
const User = mongoose.model('User', {
  email: String,
  password: String,
});

// Project model
const Project = mongoose.model('Project', {
  name: String,
  userId: String,
  createdAt: Date,
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Register endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create a new user
    const user = new User({
      email,
      password: hashedPassword,
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Create token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project endpoint
app.post('/projects', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    const project = new Project({
      name,
      userId: req.user._id,
      createdAt: new Date(),
    });
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get projects endpoint
app.get('/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deploy project endpoint
app.post('/deploy', authenticateToken, (req, res) => {
  // Implementation would depend on your deployment strategy
  // This could involve Docker, serverless functions, etc.
  res.json({
    success: true,
    deploymentUrl: `https://${req.body.projectName}.lethabo.app`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});