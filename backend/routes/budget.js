const express = require('express');
const db = require('../db');
const { authMiddleware } = require('./utils');
const router = express.Router();

// add entry
router.post('/', authMiddleware, async (req,res)=>{
  const { amount, type, category, note, date } = req.body;
  const userId = req.user.id;
  try {
    const r = await db.query(
      `INSERT INTO budgets (user_id, amount, type, category, note, entry_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, amount, type, category || 'general', note || null, date || new Date()]
    );
    res.json(r.rows[0]);
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

// list entries
router.get('/', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  const { type, category } = req.query;
  try {
    let q = 'SELECT * FROM budgets WHERE user_id=$1 ORDER BY entry_date DESC';
    let params = [userId];
    if(type){
      q = 'SELECT * FROM budgets WHERE user_id=$1 AND type=$2 ORDER BY entry_date DESC'; params = [userId,type];
    } else if(category){
      q = 'SELECT * FROM budgets WHERE user_id=$1 AND category=$2 ORDER BY entry_date DESC'; params = [userId,category];
    }
    const r = await db.query(q, params);
    res.json(r.rows);
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

// summary (balance & category sums)
router.get('/summary', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  try {
    const balR = await db.query(`SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount WHEN type='expense' THEN -amount END),0) as balance FROM budgets WHERE user_id=$1`, [userId]);
    const catR = await db.query(`SELECT category, SUM(CASE WHEN type='income' THEN amount WHEN type='expense' THEN -amount END) as net FROM budgets WHERE user_id=$1 GROUP BY category`, [userId]);
    res.json({balance: parseFloat(balR.rows[0].balance), categories: catR.rows});
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

module.exports = router;