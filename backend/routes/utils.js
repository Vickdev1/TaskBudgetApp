const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:'Unauthorized'});
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id || payload.sub, email: payload.email };
    next();
  } catch(e) {
    return res.status(401).json({error:'Invalid token'});
  }
}

module.exports = { authMiddleware };