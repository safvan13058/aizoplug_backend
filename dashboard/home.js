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

// api find charger station

const findCharger = async (req, res) => {
  const userId = req.user.id
  if (isNaN(userId)) {
    return res.res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const location = 'SELECT cs.id AS station_id, cs.name, cs.latitude, cs.longitude, cs.amenities, cs.contact_info FROM charging_stations cs JOIN user_station_partners usp ON cs.id = usp.station_id WHERE usp.user_id = $1';
    const { rows } = await db.query(location, [userId])
    const response = rows.map(station => ({
      ...station,
      map_url: `https://www.google.com/maps?q=${station.latitude},${station.longitude}`
    }));

    res.json(response);
  } catch (err) {
    console.error('Error fetching chargers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
  

}


module.exports = { countstation, chargerStatus, findCharger }
