const express = require('express');
const db = require('../db');
const { authMiddleware } = require('./utils');
const router = express.Router();

// create task
router.post('/', authMiddleware, async (req,res)=>{
  const { title, description, category, due_date } = req.body;
  const userId = req.user.id;
  try {
    const result = await db.query(
      `INSERT INTO tasks (user_id,title,description,category,due_date) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, title, description, category || 'general', due_date || null]
    );
    res.json(result.rows[0]);
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

// list tasks (optionally filter by category)
router.get('/', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  const { category } = req.query;
  try {
    let q = 'SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC';
    let params = [userId];
    if(category){
      q = 'SELECT * FROM tasks WHERE user_id=$1 AND category=$2 ORDER BY created_at DESC';
      params = [userId, category];
    }
    const result = await db.query(q, params);
    res.json(result.rows);
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

// toggle complete
router.put('/:id/complete', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  const id = req.params.id;
  try {
    await db.query('UPDATE tasks SET completed = NOT completed, completed_at = CASE WHEN completed THEN NULL ELSE NOW() END WHERE id=$1 AND user_id=$2', [id,userId]);
    const r = await db.query('SELECT * FROM tasks WHERE id=$1 AND user_id=$2', [id,userId]);
    res.json(r.rows[0]);
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

// delete
router.delete('/:id', authMiddleware, async (req,res)=>{
  const userId = req.user.id;
  const id = req.params.id;
  try {
    await db.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [id,userId]);
    res.json({ok:true});
  } catch(err){ console.error(err); res.status(500).json({error:'server'})}
});

module.exports = router;