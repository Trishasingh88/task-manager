const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const auth = require('./middleware/auth');

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: '*'
  })
);

app.use(express.json());


// ==========================================
// DATABASE CONNECTION
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


// ==========================================
// TEST ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API is running'
  });
});


// ==========================================
// AUTHENTICATION
// ==========================================


// ------------------------------------------
// REGISTER
// ------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await user.save();

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.status(201).json({
      message: 'Registration successful',

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Register error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ------------------------------------------
// LOGIN
// ------------------------------------------

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      message: 'Login successful',

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ==========================================
// USER PROFILE
// ==========================================

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json(user);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ==========================================
// TASK CRUD APIs
// ==========================================


// ------------------------------------------
// CREATE TASK
// POST /api/tasks
// ------------------------------------------

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: 'Task title is required'
      });
    }

    const newTask = new Task({
      userId: req.user.id,
      title,
      description,
      category
    });

    await newTask.save();

    res.status(201).json(newTask);

  } catch (error) {
    console.error('Create task error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ------------------------------------------
// GET ALL TASKS
// GET /api/tasks
// ------------------------------------------

app.get('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user.id
    }).sort({
      createdAt: -1
    });

    res.json(tasks);

  } catch (error) {
    console.error('Get tasks error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ------------------------------------------
// GET SINGLE TASK
// GET /api/tasks/:id
// ------------------------------------------

app.get('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json(task);

  } catch (error) {
    console.error('Get task error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ------------------------------------------
// UPDATE TASK
// PUT /api/tasks/:id
// ------------------------------------------

app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      completed,
      category
    } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      {
        title,
        description,
        completed,
        category
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json(task);

  } catch (error) {
    console.error('Update task error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ------------------------------------------
// MARK TASK COMPLETE / INCOMPLETE
// PATCH /api/tasks/:id/toggle
// ------------------------------------------

app.patch('/api/tasks/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    task.completed = !task.completed;

    await task.save();

    res.json(task);

  } catch (error) {
    console.error('Toggle task error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ------------------------------------------
// DELETE TASK
// DELETE /api/tasks/:id
// ------------------------------------------

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
});


// ==========================================
// 404 ROUTE
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});


// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});