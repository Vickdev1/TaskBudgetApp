const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if(!email || !password) return res.status(400).json({error:'Email and password required'});
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id,name,email',
      [name || null, email, hashed]
    );
    const user = result.rows[0];
    const token = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, { expiresIn: '7d' });
    res.json({user, token});
  } catch (err) {
    if(err.code === '23505') return res.status(400).json({error:'Email already exists'});
    console.error(err);
    res.status(500).json({error:'Server error'});
  }
});

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if(result.rows.length===0) return res.status(400).json({error:'Invalid credentials'});
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({error:'Invalid credentials'});
    const token = jwt.sign({id: user.id, email: user.email}, JWT_SECRET, { expiresIn: '7d' });
    res.json({user:{id:user.id,name:user.name,email:user.email}, token});
  } catch (err) {
    console.error(err);
    res.status(500).json({error:'Server error'});
  }
});

module.exports = router;