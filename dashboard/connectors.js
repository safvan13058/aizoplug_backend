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

const deleteConnector = async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM connectors WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Connector not found' });
      }
  
      res.json({ message: 'Connector deleted successfully', connector: result.rows[0] });
    } catch (err) {
      console.error('Error deleting connector:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

const deleteswitch=  async (req, res) => {
      const { deviceId } = req.params;
  
      try {
        // Step 1: Find the thingId for this device
        const thingResult = await pool.query(
          'SELECT thingId FROM devices WHERE deviceId = $1',
          [deviceId]
        );
  
        if (thingResult.rowCount === 0) {
          return res.status(404).json({ error: 'Device not found' });
        }
  
        const thingId = thingResult.rows[0].thingid;
  
        // Step 2: Delete all plug_switches for devices under this thingId
        const deleteResult = await pool.query(
          `DELETE FROM plug_switches
           WHERE device_id IN (
             SELECT deviceId FROM devices WHERE thingId = $1
           )
           RETURNING *`,
          [thingId]
        );
  
        if (deleteResult.rowCount === 0) {
          return res.status(404).json({ message: 'No plug switches found for devices of this thing' });
        }
  
        res.json({
          message: 'Plug switches for all devices under the thing deleted successfully',
          deleted: deleteResult.rows
        });
  
      } catch (err) {
        console.error('Error deleting plug switches:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }  

// Update connector field
const updateconnector= async (req, res) => {
  const connectorId = req.params.id;
  const { field, value } = req.body;

  // Validate allowed fields
  const allowedFields = ['type', 'power_output', 'state', 'status', 'ocpp_id', 'last_updated'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ error: 'Invalid field name' });
  }

  try {
    const query = `UPDATE connectors SET ${field} = $1, last_updated = NOW() WHERE id = $2 RETURNING *`;
    const result = await pool.query(query, [value, connectorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connector not found' });
    }

    res.status(200).json({ message: 'Connector updated', connector: result.rows[0] });
  } catch (err) {
    console.error('Error updating connector:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = { addConnector, deleteConnector,deleteswitch,updateconnector};