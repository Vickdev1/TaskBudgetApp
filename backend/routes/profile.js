const express = require('express');
const db = require('../db');
const { authMiddleware } = require('./utils');
const router = express.Router();

router.get('/', authMiddleware, async (req,res)=>{
  try {
    const r = await db.query('SELECT id,name,email FROM users WHERE id=$1', [req.user.id]);
    res.json(r.rows[0]);
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

module.exports = router;