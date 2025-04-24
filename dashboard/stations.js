const pool = require('../middelware/db');
const express = require('express');
const app = express();
app.use(express.json()); // for parsing application/json



const addstations = async (req, res) => {
    const client = await pool.connect();
    const {
      name,
      latitude,
      longitude,
      amenities,
      contact_info,
      dynamic_pricing,
      partners
    } = req.body;
  
    try {
      // Validate partner array
      if (!Array.isArray(partners) || partners.length === 0) {
        return res.status(400).json({ error: 'At least one partner is required' });
      }
  
      await client.query('BEGIN');
  
      // Insert station
      const stationResult = await client.query(
        `INSERT INTO charging_stations 
         (name, latitude, longitude, amenities, contact_info, dynamic_pricing)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, latitude, longitude, amenities, contact_info, dynamic_pricing]
      );
      const station = stationResult.rows[0];
  
      // Insert partners
      for (const partner of partners) {
        const { user_id, role = 'partner', share_percentage = 0.0 } = partner;
  
        if (!user_id) {
          throw new Error('Each partner must have a user_id');
        }
  
        await client.query(
          `INSERT INTO user_station_partners 
           (user_id, station_id, share_percentage, role)
           VALUES ($1, $2, $3, $4)`,
          [user_id, station.id, share_percentage, role]
        );
      }
  
      await client.query('COMMIT');
  
      res.status(201).json({
        message: 'Charging station and partners added successfully',
        station
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating station and partners:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      client.release();
    }
  };

const editStation = async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
  
    // If no fields provided, return 400
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }
  
    // Build dynamic SET clause
    const setClauses = [];
    const values = [];
    let index = 1;
  
    for (const [key, value] of Object.entries(fields)) {
      setClauses.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  
    // Add updated_at
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  
    // Add station ID for WHERE clause
    values.push(id);
  
    const query = `
      UPDATE charging_stations
      SET ${setClauses.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;
  
    try {
      const result = await pool.query(query, values);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Station not found' });
      }
  
      res.json({
        message: 'Charging station updated successfully',
        station: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating station:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  

const listStations = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM charging_stations ORDER BY created_at DESC`
      );
  
      res.json({ stations: result.rows });
    } catch (error) {
      console.error('Error fetching stations:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

const deleteStation = async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query(
        `DELETE FROM charging_stations WHERE id = $1 RETURNING *`,
        [id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Station not found' });
      }
  
      res.json({
        message: 'Charging station deleted successfully',
        station: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting station:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

const listuserstation=async (req, res) => {
    const userId = parseInt(req.user.id);
  
    try {
      const query = `
        SELECT 
          cs.id AS station_id,
          cs.name,
          cs.latitude,
          cs.longitude,
          cs.amenities,
          cs.contact_info,
          cs.dynamic_pricing,
          cs.created_at,
          cs.updated_at,
          usp.share_percentage,
          usp.role,
          usp.joined_at
        FROM 
          charging_stations cs
        JOIN 
          user_station_partners usp ON cs.id = usp.station_id
        WHERE 
          usp.user_id = $1
      `;
  
      const result = await pool.query(query, [userId]);
  
      res.json({ stations: result.rows });
    } catch (error) {
      console.error('Error fetching user stations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// GET /station/devices?type=charger|switch
const stationconnectors=async (req, res) => {
  const { type} = req.query;
  const {station_id }=req.params;

  try {
    if (!station_id) {
      return res.status(400).json({ error: 'station_id is required' });
    }

    let result = {};

    if (type === 'charger') {
      const { rows } = await pool.query(
        'SELECT * FROM connectors WHERE station_id = $1',
        [station_id]
      );
      result.chargers = rows;

    } else if (type === 'switch') {
      const { rows } = await pool.query(
        'SELECT * FROM plug_switches WHERE station_id = $1',
        [station_id]
      );
      result.switches = rows;

    } else {
      const [connectors, plugSwitches] = await Promise.all([
        pool.query('SELECT * FROM connectors WHERE station_id = $1', [station_id]),
        pool.query('SELECT * FROM plug_switches WHERE station_id = $1', [station_id]),
      ]);
      result = {
        chargers: connectors.rows,
        switches: plugSwitches.rows,
      };
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching devices:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const displayChargerAndStation = async (req, res) => {
  const { ocppid } = req.params;

  try {
    const query = `
      SELECT 
        c.id AS connector_id,
        c.type AS connector_type,
        c.power_output,
        c.state,
        c.status,
        c.ocpp_id,
        c.last_updated,
        c.created_at AS connector_created,
        cs.id AS station_id,
        cs.name AS station_name,
        cs.latitude,
        cs.longitude,
        cs.amenities,
        cs.contact_info,
        cs.dynamic_pricing,
        cs.created_at AS station_created,
        cs.updated_at AS station_updated
      FROM 
        connectors c
      JOIN 
        charging_stations cs ON c.station_id = cs.id
      WHERE 
        c.ocpp_id = $1
    `;

    const { rows } = await pool.query(query, [ocppid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: `No connector found with ocpp_id ${ocpp}` });
    }

    const row = rows[0];

    const result = {
      connector: {
        id: row.connector_id,
        type: row.connector_type,
        power_output: row.power_output,
        state: row.state,
        status: row.status,
        ocpp_id: row.ocpp_id,
        last_updated: row.last_updated,
        created_at: row.connector_created
      },
      station: {
        id: row.station_id,
        name: row.station_name,
        latitude: row.latitude,
        longitude: row.longitude,
        amenities: row.amenities,
        contact_info: row.contact_info,
        dynamic_pricing: row.dynamic_pricing,
        created_at: row.station_created,
        updated_at: row.station_updated
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching charger and station by ocpp_id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = {addstations,editStation,listStations,deleteStation,listuserstation,stationconnectors, displayChargerAndStation};