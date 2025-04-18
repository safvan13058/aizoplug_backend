const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json


const addConnector = async (req, res) => {
    const { station_id } = req.params;
    const {
      type,
      power_output,
      state,
      status,
      ocpp_id,
      last_updated = new Date()
    } = req.body;
  
    try {
      const result = await pool.query(
        `INSERT INTO connectors (
          station_id, type, power_output, state, status, ocpp_id, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [station_id, type, power_output, state, status, ocpp_id, last_updated]
      );
  
      res.status(201).json({
        message: 'Connector added successfully',
        connector: result.rows[0]
      });
    } catch (err) {
      console.error('Error adding connector:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



module.exports = { addConnector};