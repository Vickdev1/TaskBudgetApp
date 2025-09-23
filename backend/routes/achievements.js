const express = require('express');
const db = require('../db');
const { authMiddleware } = require('./utils');
const router = express.Router();

// Get achievements for user
router.get('/', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  try {
    const r = await db.query('SELECT * FROM achievements WHERE user_id=$1 ORDER BY earned_at DESC', [userId]);
    res.json(r.rows);
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

// Check and award achievements (call after relevant actions on frontend)
router.post('/check', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  try {
    // Example rules:
    // 1) 5+ tasks completed total -> Productive Planner
    const taskCountR = await db.query('SELECT COUNT(*) FROM tasks WHERE user_id=$1 AND completed=true', [userId]);
    const completed = parseInt(taskCountR.rows[0].count,10);
    let awarded = [];
    if(completed >= 5){
      const exists = await db.query('SELECT id FROM achievements WHERE user_id=$1 AND key=$2', [userId,'productive_planner']);
      if(exists.rows.length===0){
        const ins = await db.query('INSERT INTO achievements (user_id, key, title, description) VALUES ($1,$2,$3,$4) RETURNING *', [userId,'productive_planner','Productive Planner','Completed 5 tasks']);
        awarded.push(ins.rows[0]);
      }
    }

    // 2) example: 7+ days budget entries -> disciplined bookkeeper
    const daysR = await db.query(`SELECT COUNT(DISTINCT DATE(entry_date)) as days FROM budgets WHERE user_id=$1`, [userId]);
    const days = parseInt(daysR.rows[0].days,10);
    if(days >= 7){
      const exists = await db.query('SELECT id FROM achievements WHERE user_id=$1 AND key=$2', [userId,'disciplined_bookkeeper']);
      if(exists.rows.length===0){
        const ins = await db.query('INSERT INTO achievements (user_id, key, title, description) VALUES ($1,$2,$3,$4) RETURNING *', [userId,'disciplined_bookkeeper','Disciplined Bookkeeper','Tracked budget for 7 days']);
        awarded.push(ins.rows[0]);
      }
    }

    res.json({awarded});
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

module.exports = router;