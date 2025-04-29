const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json
// const getchargingsession=async (req, res) => {
//     const userId = req.user.id;
//     const { status, from, to, limit = 30, page = 1 } = req.query;
  
//     let filters = ['user_id = $1'];
//     let values = [userId];
//     let idx = 2;
  
//     // Optional filters
//     if (status) {
//       filters.push(`status = $${idx}`);
//       values.push(status);
//       idx++;
//     }
//     if (from) {
//       filters.push(`start_time >= $${idx}`);
//       values.push(new Date(from));
//       idx++;
//     }
//     if (to) {
//       filters.push(`start_time <= $${idx}`);
//       values.push(new Date(to));
//       idx++;
//     }
  
//     const offset = (parseInt(page) - 1) * parseInt(limit);
//     values.push(limit);
//     values.push(offset);
  
//     const query = `
//       SELECT * FROM charging_sessions
//       WHERE ${filters.join(' AND ')}
//       ORDER BY start_time DESC
//       LIMIT $${idx} OFFSET $${idx + 1}
//     `;
  
//     const countQuery = `
//       SELECT COUNT(*) FROM charging_sessions
//       WHERE ${filters.join(' AND ')}
//     `;
  
//     try {
//       const [dataResult, countResult] = await Promise.all([
//         pool.query(query, values),
//         pool.query(countQuery, values.slice(0, idx - 1))
//       ]);
  
//       res.json({
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total_count: parseInt(countResult.rows[0].count),
//         sessions: dataResult.rows
//       });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
 
  const getchargingsession = async (req, res) => {
    const userId = req.user.id;
    const { status, from, to, limit = 30, page = 1 } = req.query;
  
    let filters = ['user_id = $1'];
    let values = [userId];
    let idx = 2;
  
    if (status) {
      filters.push(`status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (from) {
      filters.push(`start_time >= $${idx}`);
      values.push(new Date(from));
      idx++;
    }
    if (to) {
      filters.push(`start_time <= $${idx}`);
      values.push(new Date(to));
      idx++;
    }
  
    const offset = (parseInt(page) - 1) * parseInt(limit);
    values.push(limit);
    values.push(offset);
  
    const sessionQuery = `
      SELECT * FROM charging_sessions
      WHERE ${filters.join(' AND ')}
      ORDER BY start_time DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
  
    const countQuery = `
      SELECT COUNT(*) FROM charging_sessions
      WHERE ${filters.join(' AND ')}
    `;
  
    try {
      const [dataResult, countResult] = await Promise.all([
        pool.query(sessionQuery, values),
        pool.query(countQuery, values.slice(0, idx - 1))
      ]);
  
      const sessions = dataResult.rows;
  
      // Extract connector IDs
      const connectorIds = [...new Set(sessions.map(s => s.connector_id).filter(Boolean))];
  
      let connectors = [];
      let stationIds = [];
      if (connectorIds.length) {
        const connectorResult = await pool.query(
          `SELECT * FROM connectors WHERE id = ANY($1)`,
          [connectorIds]
        );
        connectors = connectorResult.rows;
  
        // Extract station IDs from connectors
        stationIds = [...new Set(connectors.map(c => c.station_id).filter(Boolean))];
      }
  
      let stations = [];
      if (stationIds.length) {
        const stationResult = await pool.query(
          `SELECT * FROM charging_stations WHERE id = ANY($1)`,
          [stationIds]
        );
        stations = stationResult.rows;
      }
  
      res.json({
        page: parseInt(page),
        limit: parseInt(limit),
        total_count: parseInt(countResult.rows[0].count),
        sessions,
        connectors,
        stations
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
module.exports={getchargingsession}