const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const budgetRoutes = require('./routes/budget');
const achievementsRoutes = require('./routes/achievements');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Backend listening on ${PORT}`));