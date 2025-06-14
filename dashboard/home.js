const express = require('express')
const home = express.Router()
const db = require('../middelware/db')
home.use(express.json())
const { validateJwt, authorizeRoles } = require('../middelware/auth');



// API route to get station count for a user
const countstation = async (req, res) => {
  const userId = req.user.id

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

// API Charger Status and State
const chargerStatus = async (req, res) => {
  const userId = req.user.id
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });

  const stateQuery = `
    SELECT c.state, COUNT(*) AS count
    FROM connectors c
    JOIN charging_stations cs ON c.station_id = cs.id
    JOIN user_station_partners usp ON usp.station_id = cs.id
    WHERE usp.user_id = $1
    GROUP BY c.state;
  `;

  const statusQuery = `
    SELECT c.status, COUNT(*) AS count
    FROM connectors c
    JOIN charging_stations cs ON c.station_id = cs.id
    JOIN user_station_partners usp ON usp.station_id = cs.id
    WHERE usp.user_id = $1
    GROUP BY c.status;
  `;
  // console.log(`state:${stateQuery} ,, status :${statusQuery} `);

  try {
    const [stateResult, statusResult] = await Promise.all([
      db.query(stateQuery, [userId]),
      db.query(statusQuery, [userId])
    ]);

    const stateCounts = {};
    stateResult.rows.forEach(row => {
      stateCounts[row.state] = parseInt(row.count);
    });

    const statusCounts = {};
    statusResult.rows.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
    });

    res.json({
      userId,
      connectorStates: stateCounts,
      connectorStatuses: statusCounts
    });

  } catch (err) {
    console.error('Error fetching connector data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const amountGraph = async (req, res) => {
  const userId = req.user.id;

  try {
    const host_earning = await db.query(
      `SELECT amount::TEXT, created_at
       FROM transactions
       WHERE transaction_type = 'host_earning'
         AND type = 'credit'
         AND status = 'completed'
         AND user_id = $1
       ORDER BY created_at DESC;`,
      [userId]
    );

    res.json(host_earning.rows); // This gives you the expected JSON array
  } catch (err) {
    console.error('Error fetching host earnings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
};


const getEarningsByStationId = async (req, res) => {
  const stationId = req.query.stationId;

  if (!stationId) {
    return res.status(400).json({ error: 'stationId query parameter is required' });
  }

  try {
    const result = await db.query(
      `SELECT t.amount::TEXT, t.created_at
       FROM transactions t
       INNER JOIN user_station_partners usp ON t.user_id = usp.user_id
       WHERE usp.station_id = $1
         AND t.transaction_type = 'host_earning'
         AND t.type = 'credit'
         AND t.status = 'completed'
       ORDER BY t.created_at DESC;`, 
      [stationId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching earnings by stationId:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = { countstation, chargerStatus, amountGraph, getEarningsByStationId }
