const express = require('express')
const home = express.Router() 
const db = require('../middelware/db')
home.use(express.json())
const { validateJwt, authorizeRoles } = require('../middelware/auth');



// API route to get station count for a user
const countstation= async (req, res) => {
  const userId =req.user.id

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const result = await db.query(
      'SELECT COUNT(*) AS station_count FROM user_station_partners WHERE user_id = $1',
      [userId]
    );
    const count = parseInt(result.rows[0].station_count);
    res.json({ userId, stationCount: count });
  } catch (err) {
    console.error('Error querying station count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports={countstation}
